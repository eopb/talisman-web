import { accountsState } from '@domains/accounts/recoils'
import { apiState, nativeTokenDecimalState, nativeTokenPriceState } from '@domains/chains/recoils'
import { recommendedPoolsState } from '@domains/nominationPools/recoils'
import posthog from 'posthog-js'
import { useEffect } from 'react'
import { Navigate, Outlet, createBrowserRouter, useLocation } from 'react-router-dom'
import { useRecoilValueLoadable, waitForAll } from 'recoil'

import Layout from '../layout'
import Buy from './Buy'
import Explore from './Explore'
import NFTsPage from './NFTsPage'
import Portfolio from './Portfolio'
import Staking from './Staking'
import TransactionHistory from './TransactionHistory'

const Main = () => {
  // Pre-loading
  useRecoilValueLoadable(
    waitForAll([apiState, accountsState, nativeTokenDecimalState, nativeTokenPriceState('usd'), recommendedPoolsState])
  )

  const location = useLocation()

  useEffect(() => {
    if (location.hash !== '') {
      const observer = new MutationObserver(() => {
        const element = document.getElementById(location.hash.slice(1))

        if (element !== null) {
          element.scrollIntoView({ behavior: 'smooth' })
          observer.disconnect()
        }
      })

      observer.observe(document.body, { childList: true, subtree: true })

      return observer.disconnect.bind(observer)
    }
  }, [location])

  useEffect(() => {
    posthog.capture('$pageview')
  }, [location.pathname])

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default createBrowserRouter([
  {
    path: '/',
    element: <Main />,
    children: [
      { path: '/', element: <Navigate to="portfolio" /> },
      { path: 'portfolio', element: <Portfolio /> },
      { path: 'nfts', element: <NFTsPage /> },
      { path: 'explore', element: <Explore /> },
      { path: 'staking', element: <Staking /> },
      { path: 'history', element: <TransactionHistory /> },
      { path: 'buy', element: <Buy /> },
    ],
  },
  { path: '*', element: <Navigate to="/" /> },
])
