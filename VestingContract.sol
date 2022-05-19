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
        token.transfer(ADMIN, _totalTokens);
    }

    function addWhiteList(address _addr, UserInfo _userInfo) public onlyOwner{
        userInfo[_addr] = _userInfo;
    }

    function claim() public {
        address user = msg.sender;
        require (_)
    }
     
}