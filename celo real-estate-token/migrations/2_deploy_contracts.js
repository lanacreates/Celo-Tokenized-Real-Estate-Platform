
const RealEstateToken = artifacts.require("RealEstateToken");

module.exports = function (deployer) {
    deployer.deploy(RealEstateToken);
};
