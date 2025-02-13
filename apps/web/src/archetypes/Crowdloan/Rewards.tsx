import { Stat } from '@components'
import styled from '@emotion/styled'
import { useCrowdloanById } from '@libs/talisman'

const Rewards = styled(({ id, className }: { id?: string; className?: string }) => {
  const { crowdloan } = useCrowdloanById(id)
  const rewards = crowdloan?.details?.rewards

  return (
    <div className={`crowdloan-rewards ${className}`}>
      {rewards?.tokens?.map(({ symbol, perKSM }, index) => (
        <Stat key={index} title={`${symbol} per KSM`}>
          {perKSM}
        </Stat>
      ))}
      {rewards?.custom?.map(({ title, value }, index) => (
        <Stat key={index} title={title}>
          {value}
        </Stat>
      ))}

      {rewards?.info && (
        <>
          <hr />
          <p dangerouslySetInnerHTML={{ __html: rewards?.info }}></p>
        </>
      )}
    </div>
  )
})`
  padding: 2.2rem 2.4rem;

  > .stat & + .stat {
    margin-top: 0.7rem;
  }

  > hr {
    margin: 1em 0;
  }

  > p {
    font-size: 0.8em;
    opacity: 0.8;

    &:last-child {
      margin-bottom: 0;
    }
  }
`

export default Rewards
