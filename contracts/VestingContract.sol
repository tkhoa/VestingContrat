// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";  
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";  
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";  


contract VestingContract is Ownable{

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
    }

    function fundVesting(uint256 _totalTokens) public onlyOwner{
        address ADMIN = token.owner();
        // Approve function should be called in token contract
        //token.approve(this.address, totalTokens);
        token.transferFrom(ADMIN, this.address, totalTokens);
    }

    function addWhiteList(address _userAddr, UserInfo _userInfo) public onlyOwner{
        userInfo[_userAddr].amount = _userInfo.amount;
        userInfo[_userAddr].tokensClaimed = _userInfo.tokensClaimed;
        //Cant approve because when calling a contract from other, the "owner" in _approve (ERC20) will be changed 
        //token.approve(this.address, _userAddr, _userInfo.amount);
    }

    function claim() public {
        address user = msg.sender;
        require (userInfo[user.address] != 0);
        require(now > starttime);

        uint256 remainedTokens = 0;
        uint256 remainedTokenPerPeriod = 0;
        uint256 firstReleaseTokens = firstRelease/100*userInfo[user.address].amount;

        //uint currentPeriod = 0;

        if (now > startTime){//có thể bỏ
            //nhớ đổi xuống dưới else
            if ((userInfo[user.address].tokensClaimed == 0)){
                require(totalTokens > firstReleaseTokens, "Vesting contract doesnt have enought money");

                token.transferFrom(this.address, user.address, firstReleaseTokens);
                totalTokens -= firstReleaseTokens;
                userInfo[user.address].tokensClaimed += firstReleaseTokens;
                // remainedTokens = userInfo[user.address].amount - firstReleaseTokens; //có thể sửa
                // remainedTokenPerPeriod = remainedToken / totalPeriods;

            }
            else {
                uint256 userAmount = userInfo[user.address].amount;
                uint256 userClaimedTokens = userInfo[user.address].tokensClaimed;
                uint256 tokensPerPeriod = (userAmount - firstReleaseTokens) / totalPeriods;
                uint8 claimedPeriod = (userClaimedTokens - firstReleaseTokens) / tokensPerPeriod;
                //so sanh thoi gian
                if (now >= (claimedPeriod + 1) * timePerPeriods){
                    //required
                    uint256 claimableTokens = ((now - claimedPeriod * timePerPeriods)/ timePerPeriods) * (tokensPerPeriod)
                    token.transferFrom(this.address, user.address, claimableTokens);
                    userInfo[user.address].tokensClaimed += claimableTokens;
                }
                // uint8 currentPeriod = totalPeriods - remainedTokens/ remainedTokenPerPeriod;
                // uint8 claimedPeriod = (userInfo[user.address].tokensClaimed - firstReleaseTokens)/remainedTokenPerPeriod;
                // if (  currentPeriod > claimedPeriod){
                //     uint8 claimablePeriods = currentPeriod - claimedPeriod;
                //     uint256 claimableTokens = claimablePeriods * remainedTokenPerPeriod;
                //     token.transferFrom(this.address, user.address, claimableTokens);
                //     remainedTokens = remainedTokens - claimableTokens;
                // }

            }
        }

    }
}