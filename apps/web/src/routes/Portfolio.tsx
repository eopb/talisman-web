import useAssets from '@archetypes/Portfolio/Assets'
import { AccountValueInfo } from '@components/molecules/AccountValueInfo'
import { BottomBorderNav } from '@components/molecules/BottomBorderNav'
import { useActiveAccount } from '@libs/talisman'
import { Outlet } from 'react-router'
import { Link, useMatch } from 'react-router-dom'

const Portfolio = () => {
  // useMatch
  const paths = [
    { path: '', name: 'Overview' },
    { path: 'nfts', name: 'NFTs' },
    { path: 'assets', name: 'Assets' },
    { path: 'history', name: 'History' },
  ]

  const { fiatTotal } = useAssets()
  const account = useActiveAccount()

  const currentPath = useMatch('/portfolio/:id')?.params.id ?? paths[0]?.path

  return (
    <div
      css={{
        'display': 'flex',
        'flexDirection': 'column',
        'gap': '2rem',
        'width': '100%',
        'maxWidth': '1280px',
        'margin': '3rem auto',
        '@media (min-width: 1024px)': {
          margin: '3rem auto',
        },
        'padding': '0 2.4rem',
      }}
    >
      <AccountValueInfo address={account?.address} name={account?.name ?? 'All Accounts'} balance={fiatTotal} />
      <BottomBorderNav>
        {paths.map(path => (
          <BottomBorderNav.Item key={path.path} selected={path.path === currentPath}>
            <Link to={path.path}>{path.name}</Link>
          </BottomBorderNav.Item>
        ))}
      </BottomBorderNav>
      <Outlet context={{}} />
    </div>
  )
}

export default Portfolio
