import { substrateAccountsState } from '@domains/accounts/recoils'
import { chainIdState, chainRpcState } from '@domains/chains/recoils'
import { useChainState } from '@domains/common/hooks'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { array, assertion, jsonParser, number, object, string } from '@recoiljs/refine'
import { isNil } from 'lodash'
import { range } from 'lodash/fp'
import { useMemo } from 'react'
import { RecoilLoadable, constSelector, selector, selectorFamily, useRecoilValue, useRecoilValueLoadable } from 'recoil'
const STORAGE_KEY = 'fast-unstake-exposure'

// Can't re-use global api because fast unstake eligibility check is very resource intensive and will congest all other subscriptions
const fastUnstakeApiState = selector({
  key: 'FastUnstakeApi',
  get: ({ get }) => ApiPromise.create({ provider: new WsProvider(get(chainRpcState)) }),
})

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

      const api = get(fastUnstakeApiState)
      const startEraToCheck = activeEra - api.consts.staking.bondingDuration.toNumber()

      const exposed = await Promise.all(
        range(startEraToCheck, activeEra).map(era =>
          api.query.staking.erasStakers
            .entries(era)
            .then(x => x.flatMap(([_, exposure]) => exposure.others.flatMap(({ who }) => who.toString())))
            .then(array => new Set(array))
        )
      ).then(x => x.reduce((prev, curr) => new Set([...prev, ...curr])))

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          fastUnstakeExposureAsssertion({ network: get(chainIdState), era: activeEra, exposed: [...exposed] })
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
  const shouldCheckForFastUnstake = !erasToCheckPerBlock.valueMaybe()?.isZero()

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
