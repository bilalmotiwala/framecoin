// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IFramecoinLaunchpad {
    function initialize(string memory _name, string memory _symbol) external;
}

contract FramecoinFactory is Ownable {
    address public implementationAddress;

    constructor(address _implementationAddress, address _owner) Ownable(_owner) {
        require(_implementationAddress != address(0), "Implementation address cannot be zero.");
        implementationAddress = _implementationAddress;
    }

    function deployFramecoinProxy(string memory name, string memory symbol) public returns (address) {
        // Create a new proxy that points to the implementation contract
        ERC1967Proxy proxy = new ERC1967Proxy(
            implementationAddress,
            abi.encodeWithSelector(IFramecoinLaunchpad.initialize.selector, name, symbol)
        );
        
        // Return the address of the new proxy
        return address(proxy);
    }

    function updateImplementationAddress(address _implementationAddress) public onlyOwner {
        require(_implementationAddress != address(0), "Implementation address cannot be zero.");
        implementationAddress = _implementationAddress;
    }

    function getLaunchpadAddress() public view returns (address) {
        return implementationAddress;
    }
}