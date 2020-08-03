const QuotationContract = artifacts.require("QuotationContract");

module.exports = function(deployer) {
  deployer.deploy(QuotationContract);
};
