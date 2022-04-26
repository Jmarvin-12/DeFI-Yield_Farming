// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm {

    string public test = "hello";

    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner;

    mapping (address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping (address => bool) public isStaking;

    address[] public stakers;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner= msg.sender;
    }

    // 1. Stake tokens deposito de DAI para ganar DAPP
    function stakeTokens(uint _amount) public {
        
        require(_amount > 0, "la cantidad no puede ser 0");

        // transferr 
        daiToken.transferFrom(msg.sender, address(this), _amount);
        // Actualizar balance de staking
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        //Agregar a lista de stakers si es nuevo
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }

    // 2. Unstaking tokens sacar dinero de la app
    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];

        require(balance > 0, "Balance de staking no puede ser 0");

        daiToken.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;

        isStaking[msg.sender] = false;
        
    }

    //3. Emitiendo tokens, tokens ganados como interes
    function issueTokens() public{
        require(msg.sender == owner, "El que envie debe ser el owner");

        for(uint i=0; i<stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];

            if(balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }

}