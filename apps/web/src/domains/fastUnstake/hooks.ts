import { substrateAccountsState } from '@domains/accounts/recoils'
import { chainIdState, chainRpcState } from '@domains/chains/recoils'
import { useChainState } from '@domains/common/hooks'
import { array, assertion, jsonParser, number, object, string } from '@recoiljs/refine'
import { isNil } from 'lodash'
import { useMemo } from 'react'
import { RecoilLoadable, constSelector, selectorFamily, useRecoilValue, useRecoilValueLoadable } from 'recoil'
import { Thread, spawn } from 'threads'

import { WorkerModule } from './worker'

const STORAGE_KEY = 'fast-unstake-exposure'

const fastUnstakeExposureChecker = object({
  network: string(),
  era: number(),
  exposed: array(string()),
})

const fastUnstakeExposureAsssertion = assertion(fastUnstakeExposureChecker)

const fastUnstakeExposureJsonParser = jsonParser(fastUnstakeExposureChecker)

const exposedAccountsState = selectorFamily({
  key: 'ExposedAccount',
  get:
    (activeEra: number) =>
    async ({ get }) => {
      const storedValue = fastUnstakeExposureJsonParser(sessionStorage.getItem(STORAGE_KEY))

      if (!isNil(storedValue) && storedValue.era === activeEra && storedValue.network === get(chainIdState)) {
        return new Set(storedValue.exposed)
      }

      const worker = await spawn<WorkerModule>(new Worker(new URL('./worker', import.meta.url)))
      const exposed = await worker.getExposedAccounts(get(chainRpcState), activeEra)

      Thread.terminate(worker)

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          fastUnstakeExposureAsssertion({ network: get(chainIdState), era: activeEra, exposed: Array.from(exposed) })
        )
      )

      return exposed
    },
  cachePolicy_UNSTABLE: { eviction: 'most-recent' },
})

export const useExposedAccounts = (options?: { enabled?: boolean } | undefined) => {
  const activeEra = useChainState('query', 'staking', 'activeEra', [], { enabled: options?.enabled })

  const loadable = useRecoilValueLoadable(
    activeEra.state !== 'hasValue'
      ? constSelector(new Set([]))
      : exposedAccountsState(activeEra.contents.unwrapOrDefault().index.toNumber())
  )

  if (activeEra.state !== 'hasValue') {
    return RecoilLoadable.loading() as typeof loadable
  }

  return loadable
}

export const useFastUnstakeEligibleAccounts = () => {
  const accounts = useRecoilValue(substrateAccountsState)
  const erasToCheckPerBlock = useChainState('query', 'fastUnstake', 'erasToCheckPerBlock', [])

  // Only check when some accounts has no active nominations & when fast unstaking is enalbed
  const shouldCheckForFastUnstake = erasToCheckPerBlock.valueMaybe()?.isZero() === false

  const exposedAccountsLoadable = useExposedAccounts({ enabled: shouldCheckForFastUnstake })
  const ledgersLoadable = useChainState(
    'query',
    'staking',
    'ledger.multi',
    accounts.map(x => x.address)
  )

  const emptyArray = useMemo(() => [] as typeof accounts, [])

  if (!shouldCheckForFastUnstake) {
    return RecoilLoadable.of(emptyArray)
  }

  return RecoilLoadable.all([exposedAccountsLoadable, ledgersLoadable]).map(([exposedAccounts, ledgers]) =>
    accounts.filter(
      account =>
        !exposedAccounts.has(account.address) &&
        ledgers.find(ledger => ledger.unwrapOrDefault().stash.toString() === account.address)?.unwrapOrDefault()
          .unlocking.length === 0
    )
  )
}
