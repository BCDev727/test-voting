import React, {useState, useEffect} from 'react'

const VotingApp = ({web3Instance, votingContract, ethAccount}) => {
    const [dexValue, setDexValue] = useState('')
    const [hashValue, setHashValue] = useState('')
    const [activeVal, setActiveVal] = useState('1')

    const [isCommited, setCommited] = useState(false)
    const [commitRequest, setCommitRequest] = useState(false)
    const [revealRequest, setrevealRequest] = useState(false)

    const [winner, setWinner] = useState('')

    const [winnerCount, setWinnerCount] = useState(0)
    const [playerCount, setPlayerCount] = useState(0)

    useEffect(() => {
        if(dexValue && dexValue !== '') {
            const _dexval = activeVal + dexValue
            const _hashvalue = web3Instance.utils.soliditySha3({t: "string", v: _dexval})

            setHashValue(_hashvalue)
        }
        else {
            setHashValue('')
        }
    }, [dexValue, activeVal])

    const handleActive = (value) => {
        if(isCommited)
            return
            
        setActiveVal(value)
    }

    const handleCommit = async () => {
        if(hashValue && hashValue !== '') {
            setCommitRequest(true)
            try {
                await votingContract.methods.commitVote(hashValue).send({from: ethAccount[0]})
                setCommited(true)
            }
            catch (err) {
                console.log(err)
            }
            setCommitRequest(false)
        }
        else {
            alert('Please input value')
        }
    }

    const handleReveal = async () => {
        if(hashValue && hashValue !== '' && dexValue && dexValue !== '') {
            setrevealRequest(true)
            try {
                const _dexValue = activeVal + dexValue
                await votingContract.methods.revealVote(_dexValue, hashValue).send({from: ethAccount[0]})
                setCommited(false)
            }
            catch (err) {
                console.log(err)
            }
            setrevealRequest(false)
        }
        else {
            alert('Please check input value')
        }
    }

    const handleResult = async () => {
        const _winner = await votingContract.methods.getWinner().call()
        setWinner(_winner)
        const _winner_list = await votingContract.methods.getVoteCommitsArray().call()
        setPlayerCount(_winner_list.length)

        await votingContract.methods.votesForChoice1().call(function(err, result) {
            if(_winner === 'YES') {
                setWinnerCount(result)
            }
            else {
                setWinnerCount(_winner_list.length - result)
            }
        })
    }
    
    return (
        <div className='voting-section'>
            <div className='input-section'>
                <input value={dexValue} onChange={(e) => setDexValue(e.target.value)} placeholder='input value' />
                <input value={hashValue} readOnly={true} />
            </div>
            <div className='select-section'>
                <div onClick={() => handleActive('1')} >
                    <input type="radio" readOnly checked={activeVal === '1'}/>{'Tiger'}
                </div>
                <div onClick={() => handleActive('2')} >
                    <input type="radio" readOnly checked={activeVal === '2'}/>{'Lion'}
                </div>
            </div>
            <div className='action-section'>
                <button onClick={handleCommit} disabled={commitRequest || isCommited}>Commit</button>
                <button onClick={handleReveal} disabled={revealRequest || !isCommited}>Reveal</button>
                <button onClick={handleResult} >Get Result</button>
            </div>
            <div className='result-section' style={winner !== '' ? {display: 'block'} : {display: 'none'}}>
                <div><span>Winner: </span>{winner === 'YES' ? 'Tiger' : winner === 'NO' ? 'Lion' : winner}</div>
                <div><span>All Player: {playerCount}</span>&nbsp;&nbsp;&nbsp;<span>Voter: </span>{winnerCount}</div>
            </div>
        </div>
    )
}

export default VotingApp