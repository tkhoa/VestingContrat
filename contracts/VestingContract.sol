// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";  
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";  
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";  
import "@openzeppelin/contracts/utils/math/SafeMath.sol";  
import "hardhat/console.sol";

contract VestingContract is Ownable{
    using SafeMath for uint256;

    struct UserInfo{
        uint256 amount;
        uint256 tokensClaimed;
    }

    mapping(address => UserInfo) public userInfo;

    ERC20 public token;
    uint256 public firstRelease;
    uint256 public startTime;
    uint256 public totalPeriods;
    uint256 public timePerPeriods;
    uint256 public cliff;
    uint256 public totalTokens;

    event TokenClaimed(address _address, uint256 _tokensClaimed);
    event VestingFunds(uint256 _totalTokens); 
    event SetStartTime(uint256 _startTime);
    event AddWhitelistUser(address _address, uint256 _amount);
    event RemoveWhitelistUser(address _address);

    constructor(address _token,
                uint256 _firstRelease,
                uint256 _startTime,
                uint256 _totalPeriods,
                uint256 _timePerPeriods,
                uint256 _cliff,
                uint256 _totalTokens 
    ) {
        token = ERC20(_token);
        firstRelease = _firstRelease;
        startTime = _startTime;
        totalPeriods = _totalPeriods;
        timePerPeriods = _timePerPeriods;
        cliff = _cliff;
        totalTokens = _totalTokens;

        emit SetStartTime(_startTime);
    }

    function getBalance() public view returns (uint256){
        return totalTokens;
    }

    function getUserAmount(address addr) public view returns ( uint256){
        return userInfo[addr].amount;
    }

    function getUserTokenClaimed(address addr) public view returns ( uint256){
        return userInfo[addr].tokensClaimed;
    }

    function getTotalTokens() public view  returns (uint256){
        return totalTokens;
    }

    function fundVesting(uint256 _totalTokens) public onlyOwner{
        address ADMIN = msg.sender;
        // Approve function should be called in token contract
        //token.approve(this.address, totalTokens);
        token.transferFrom(ADMIN, address(this), _totalTokens);
        // console.log("admin addr:",ADMIN);
        // console.log("vesting contract addr:",address(this));
        // console.log("total token: ", _totalTokens);
        emit VestingFunds(_totalTokens);
    }

    function addWhiteList(address _userAddr, uint256 amount, uint256 tokensClaimed) public onlyOwner{
        UserInfo memory newUser =  UserInfo(amount, tokensClaimed);
        userInfo[_userAddr] = newUser;

        // console.log("user address : ",_userAddr);
        // console.log("user amount: ",userInfo[_userAddr].amount);
        // console.log("user token claimed: ",userInfo[_userAddr].tokensClaimed);
        //Cant approve because when calling a contract from other, the "owner" in _approve (ERC20) will be changed 
        //token.approve(this.address, _userAddr, _userInfo.amount);
        // console.log(userInfo[_userAddr].amount);
        // token.approve(address(this), amount);
        // console.log("approve: ", token.allowance(address(this), address(this)));

        emit AddWhitelistUser(_userAddr, amount);
    }

    function claim() public {

        address user = msg.sender;
        require(userInfo[user].amount  > userInfo[user].tokensClaimed, "you have claimed all your tokens");
        //require (userInfo[address(user)] != 0);
        //require(now > startTime);

        uint256 firstReleaseTokens = firstRelease.mul(userInfo[address(user)].amount).div(100);
        
        console.log("firstReleaseTokens: ",firstReleaseTokens);
        console.log("test test",startTime);
        console.log("block time: ",block.timestamp);

        if (block.timestamp >= startTime){//có thể bỏ
            console.log("start time: ",startTime);
            //nhớ đổi xuống dưới else

            uint256 userClaimedTokens = userInfo[address(user)].tokensClaimed;

            if ((userClaimedTokens == 0)){

                require(totalTokens > firstReleaseTokens, "Vesting contract doesnt have enought money");
                // console.log("HERE.............");

                // console.log(address(this));
                // console.log(address(user));
                // console.log(firstReleaseTokens);
                token.transfer(address(user),firstReleaseTokens);
                userClaimedTokens= SafeMath.add(userClaimedTokens, firstReleaseTokens);

                emit TokenClaimed(address(user), firstReleaseTokens);
            }
            {
                uint256 userAmount = userInfo[address(user)].amount;
                uint256 tokensPerPeriod = userAmount.sub(firstReleaseTokens).div(totalPeriods);
                uint256 claimedPeriods = userClaimedTokens.sub(firstReleaseTokens).div(tokensPerPeriod);
                //so sanh thoi gian
                if (block.timestamp.sub(startTime).sub(cliff) >= claimedPeriods.add(1).mul(timePerPeriods)){
                    uint256 claimableTokens = 0;

                    if (block.timestamp > totalPeriods.mul(timePerPeriods)){
                        claimableTokens = userAmount.sub(userClaimedTokens);
                    } 
                    else if (claimedPeriods <= totalPeriods) {
                        claimableTokens = block.timestamp.sub(startTime).sub(cliff).div(timePerPeriods).sub(claimedPeriods).mul(tokensPerPeriod);
                    }

                    token.transfer(address(user), claimableTokens);
                    userClaimedTokens = userClaimedTokens.add(claimableTokens);
                    
                    if ((claimedPeriods == totalPeriods) && (userClaimedTokens < userAmount)){
                        claimableTokens = userAmount.sub(userClaimedTokens);
                        token.transfer(address(user), claimableTokens);
                        userClaimedTokens = userClaimedTokens.add(claimableTokens);
                    }

                    userInfo[address(user)].tokensClaimed = userClaimedTokens;
                    emit TokenClaimed(address(user), claimableTokens);
                }
                else{
                    console.log("that not yet time to withdraw tokens");
                }
                
            }
        }
    }
}