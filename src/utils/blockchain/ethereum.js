import { web3 } from "web3"

export const createContract = (address, ABI) => {
  return new web3.eth.Contract(ABI, address);
};

export const callContract = async (contract, method, args = []) => {
  try {
    return await contract.methods?.[method](...args).call();
  } catch (ex) {
    return Promise.reject(ex);
  }
};

export const sendTransaction = async (contract, method, args = [], options = {}, cb = () => { }) => {
  try {
    return contract.methods?.[method](...args).send(options, cb);
  } catch (ex) {
    return Promise.reject(ex);
  }
};
