import { useAllAccountAddresses } from '@libs/talisman'
import { Balances } from '@talismn/balances'
import { EvmErc20Module } from '@talismn/balances-evm-erc20'
import { EvmNativeModule } from '@talismn/balances-evm-native'
import { useBalances as _useBalances } from '@talismn/balances-react'
import { useChaindata, useTokens } from '@talismn/balances-react'
import { SubNativeModule } from '@talismn/balances-substrate-native'
import { SubOrmlModule } from '@talismn/balances-substrate-orml'
import { ChaindataProvider, Token, TokenList } from '@talismn/chaindata-provider'
import { isNil } from 'lodash'
import { PropsWithChildren, createContext, useContext, useMemo } from 'react'

const balanceModules = [SubNativeModule, SubOrmlModule, EvmNativeModule, EvmErc20Module]

export const useBalances = () => useBalanceContext()

function useAddressesByToken(addresses: string[] | null | undefined, tokenIds: Token['id'][]) {
  return useMemo(() => {
    if (isNil(addresses)) return {}
    return Object.fromEntries(tokenIds.map(tokenId => [tokenId, addresses]))
  }, [addresses, tokenIds])
}

type ContextProps = {
  balances: Balances | undefined
  assetsValue: string | null
  assetsValueTotal: string | null
  tokenIds: string[]
  tokens: TokenList | any
  chaindata: (ChaindataProvider & { generation?: number | undefined }) | null
}

const Context = createContext<ContextProps>({
  balances: undefined,
  assetsValue: '',
  assetsValueTotal: '',
  tokenIds: [],
  tokens: [],
  chaindata: null,
})

function useBalanceContext() {
  const context = useContext(Context)
  if (!context) throw new Error('The talisman balances provider is required in order to use this hook')

  return context
}

//
// Provider
//

export const Provider = ({ children }: PropsWithChildren) => {
  const chaindata = useChaindata()
  const addresses = useAllAccountAddresses()

  const tokens = useTokens(chaindata)

  const tokenIds = useMemo(
    () =>
      Object.values(tokens)
        // filter out testnet tokens
        .filter(({ isTestnet }) => !isTestnet)
        .map(({ id }) => id),
    [tokens]
  )

  const addressesByToken = useAddressesByToken(addresses, tokenIds)
  const balances = _useBalances(balanceModules, chaindata, addressesByToken)

  const assetsValue =
    (balances?.sum.fiat('usd').transferable ?? 0).toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
    }) ?? ' -'

  const assetsValueTotal =
    (
      (balances?.sum.fiat('usd').transferable ?? 0) +
      (balances?.sum.fiat('usd').locked ?? 0) +
      (balances?.sum.fiat('usd').reserved ?? 0)
    ).toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
    }) ?? ' -'

  const value = useMemo(
    () => ({ balances, assetsValue, tokenIds, tokens, chaindata, assetsValueTotal }),
    [balances, assetsValue, tokenIds, tokens, chaindata, assetsValueTotal]
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}
