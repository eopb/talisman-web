import { useExtrinsic, useQueryMulti, useTokenAmountFromPlanck, useTokenAmountState } from '@domains/common/hooks'
import { BN } from '@polkadot/util'
import { useMemo } from 'react'

export const usePoolUnstakeForm = (account?: string) => {
  const unbondExtrinsic = useExtrinsic('nominationPools', 'unbond')

  const queriesLoadable = useQueryMulti(['nominationPools.minJoinBond', ['nominationPools.poolMembers', account]], {
    enabled: account !== undefined,
  })

  const [input, setAmount] = useTokenAmountState('')

  const minNeededForMembership = useTokenAmountFromPlanck(queriesLoadable.contents[0])

  const available = useTokenAmountFromPlanck(queriesLoadable.valueMaybe()?.[1]?.unwrapOrDefault().points)

  const resulting = useTokenAmountFromPlanck(
    useMemo(
      () => available.decimalAmount?.planck.sub(input.decimalAmount?.planck ?? new BN(0)),
      [available.decimalAmount?.planck, input.decimalAmount?.planck]
    )
  )

  const error = useMemo(() => {
    if (queriesLoadable.state !== 'hasValue') return

    if (available.decimalAmount !== undefined && input.decimalAmount?.planck.gt(available.decimalAmount.planck)) {
      return new Error('Insufficient balance')
    }

    if (
      available.decimalAmount !== undefined &&
      input.decimalAmount !== undefined &&
      !input.decimalAmount.planck.eq(available.decimalAmount.planck) &&
      minNeededForMembership.decimalAmount !== undefined &&
      available.decimalAmount.planck.sub(input.decimalAmount.planck).lt(minNeededForMembership.decimalAmount.planck)
    ) {
      return new Error(`Need ${minNeededForMembership.decimalAmount?.toHuman()} to stay in pool`)
    }
  }, [queriesLoadable.state, available.decimalAmount, input.decimalAmount, minNeededForMembership.decimalAmount])

  return {
    extrinsic: {
      ...unbondExtrinsic,
      unbondMax: (account: string, memberAccount: string) => {
        const pool = queriesLoadable.valueMaybe()?.[1]

        if (pool === undefined) {
          throw new Error('Extrinsic not ready yet')
        }

        return unbondExtrinsic.signAndSend(account, memberAccount, pool.unwrapOrDefault().points)
      },
    },
    input,
    available,
    resulting,
    setAmount,
    error,
    isReady: queriesLoadable.state === 'hasValue',
  }
}
