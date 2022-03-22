import Web3 from 'web3';
import Engine from './Engine';
import ContractABIs from './ABIs';
import routes from '../common/routes';

const contractAddress = routes.klubToken.address;
const rpcProvider = 'https://testnet.liquichain.io/rpc';

const contract = () => {
  const { selectedAddress } = Engine.state.PreferencesController;
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcProvider));
  return new web3.eth.Contract(ContractABIs, contractAddress, { from: selectedAddress });
}

export default class Erc20Service {

  getFixedFee = async () => {
    return await contract().methods.fixedFee().call();
  }

  getBalance = async (address) => {
    return await contract().methods.balanceOf(address).call();
  }

  transfer = async (to, amount) => {
    return await contract().methods.transfer(to, amount).send();
  }
}