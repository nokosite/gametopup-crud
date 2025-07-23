import NetInfo from '@react-native-community/netinfo';

export const checkNetworkConnection = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

export const addNetworkListener = (callback: (isConnected: boolean) => void) => {
  return NetInfo.addEventListener(state => {
    callback(state.isConnected ?? false);
  });
}; 