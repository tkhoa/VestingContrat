// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;  

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";  
import "@openzeppelin/contracts/access/Ownable.sol";  

/**  
* @title OilToken is a basic ERC20 Token  
*/  
contract OilToken is ERC20, Ownable{  
 /**  
 * @dev assign totalSupply to account creating this contract 
 */  
 uint256 _CLAIM_LIMIT = 10000000000000000000;
 constructor()  ERC20("OilToken","OIL"){}

 function issueToken() public onlyOwner{
        _mint(msg.sender, 1200*10**18);
        //1000000000000000000
  }

  event claimLog(address indexed claimer, uint256 amount);

  function claim(uint amount) public{
      require(amount <= _CLAIM_LIMIT);

      address claimer = _msgSender();
      address contractOwner = this.owner();

      if (balanceOf(contractOwner) < amount){
            this.issueToken();
      } //Xử lý cấp phát thêm sau

      _approve(contractOwner, claimer, amount);
      _transfer(contractOwner, claimer, amount);

      emit claimLog(claimer, amount);
  }
}