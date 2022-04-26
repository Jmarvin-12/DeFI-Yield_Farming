const { assert } = require('chai')

const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
 .use(require('chai-as-promised'))
 .should()

function tokens(n) {
    return web3.utils.toWei(n, 'Ether')
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm

    before(async () => {
        //Carga de contratos
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //Transferir todos los DappTokens a Farm
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))
        // Enviar tokens dai a inversor
        await daiToken.transfer(investor, tokens('100'), { from: owner})
    })

    describe('Mock DAI deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Dapp Token deployment', async () => {
        it('tiene un nombre', async () => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async () => {
        it('tiene test', async () => {
            const test = await tokenFarm.test()
            assert.equal(test, 'hello')
        })

        it('el contrato ha recibido los Dapp Tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farmeado de tokens', async () => {
        
        it('Recompensa a inversores por stake mDai tokens', async () =>{
            let result
            // revistar balance de investor antes de staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'Balance de Mock Dai en wallet de inversor antes de stake correcto')
            
            // stake mock dai tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
            await tokenFarm.stakeTokens(tokens('100'), {from: investor})

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'balance de mock dai en wallet de inversor despues de stake correcto.')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'Estado staking de inversor correcto despues de stake.')
        
            await tokenFarm.issueTokens({from: owner})

            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'Balance en wallet de inversor correcto despues de obtener rewards')

            await tokenFarm.issueTokens({from: investor}).should.be.rejected
        
            await tokenFarm.unstakeTokens({from: investor})
            await tokenFarm.unstakeTokens({from: owner}).should.be.rejected;

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'Balance de mock dai en wallet de investor correcto despues de unstaking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Balance de mock dai en token farm contract correcto despues de unstaking')
        
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'balance de staking de investor correcto luego de unstaking') 
        
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'Estado de staking de investor correcto luego de unstaking')
        })
    })
})