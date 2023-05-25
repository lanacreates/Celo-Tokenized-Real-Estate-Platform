// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RealEstateToken is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Property {
        string uri;
        string metadata;
    }

    struct Sale {
        address seller;
        uint256 askingPrice;
        bool isForSale;
    }

    mapping(uint256 => Property) private _tokenDetails;
    mapping(uint256 => Sale) private _tokenSales;

    event TokenMinted(address indexed operator, uint256 indexed tokenId, string uri, string metadata);
    event TokenListedForSale(uint256 indexed tokenId, uint256 askingPrice);

    constructor() ERC721("RealEstateToken", "RET") {}

    function mintToken(string memory uri, string memory metadata) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        
        _tokenDetails[newTokenId] = Property(uri, metadata);

        emit TokenMinted(msg.sender, newTokenId, uri, metadata);

        return newTokenId;
    }

    function listTokenForSale(uint256 tokenId, uint256 askingPrice) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Caller is not owner nor approved");
        require(askingPrice > 0, "Asking price must be greater than zero");

        _tokenSales[tokenId] = Sale(msg.sender, askingPrice, true);

        emit TokenListedForSale(tokenId, askingPrice);
    }

    function buyToken(uint256 tokenId) public payable {
        require(_tokenSales[tokenId].isForSale, "Token is not for sale");
        require(msg.value >= _tokenSales[tokenId].askingPrice, "Insufficient funds to buy the token");

        _transfer(_tokenSales[tokenId].seller, msg.sender, tokenId);
        _tokenSales[tokenId].seller = address(0);
        _tokenSales[tokenId].isForSale = false;

        (bool success, ) = _tokenSales[tokenId].seller.call{value: msg.value}("");
        require(success, "Failed to send CELO");
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenDetails[tokenId].uri;
    }

    function tokenDetails(uint256 tokenId) public view returns (Property memory) {
        return _tokenDetails[tokenId];
    }

    function tokenSales(uint256 tokenId) public view returns (Sale memory) {
        return _tokenSales[tokenId];
    }
}
