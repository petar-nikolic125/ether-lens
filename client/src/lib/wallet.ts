// MetaMask wallet connection service
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  isMetaMaskInstalled: boolean;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

class WalletService {
  private listeners: Set<(state: WalletState) => void> = new Set();
  private state: WalletState = {
    isConnected: false,
    address: null,
    chainId: null,
    isMetaMaskInstalled: false,
  };

  constructor() {
    this.checkMetaMaskInstallation();
    this.initializeEventListeners();
    this.loadPersistedState();
  }

  private checkMetaMaskInstallation() {
    this.state.isMetaMaskInstalled = !!(window.ethereum && window.ethereum.isMetaMask);
  }

  private initializeEventListeners() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
      window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
      window.ethereum.on('disconnect', this.handleDisconnect.bind(this));
    }
  }

  private handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      this.updateState({
        isConnected: false,
        address: null,
      });
    } else {
      this.updateState({
        isConnected: true,
        address: accounts[0],
      });
    }
  }

  private handleChainChanged(chainId: string) {
    this.updateState({ chainId });
    // Reload the page to reset any state that depends on the chain
    window.location.reload();
  }

  private handleDisconnect() {
    this.updateState({
      isConnected: false,
      address: null,
      chainId: null,
    });
  }

  private updateState(newState: Partial<WalletState>) {
    this.state = { ...this.state, ...newState };
    this.persistState();
    this.notifyListeners();
  }

  private persistState() {
    localStorage.setItem('wallet-state', JSON.stringify({
      isConnected: this.state.isConnected,
      address: this.state.address,
      chainId: this.state.chainId,
    }));
  }

  private loadPersistedState() {
    try {
      const saved = localStorage.getItem('wallet-state');
      if (saved) {
        const parsedState = JSON.parse(saved);
        this.state = { ...this.state, ...parsedState };
      }
    } catch (error) {
      console.warn('Failed to load persisted wallet state:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  public subscribe(listener: (state: WalletState) => void) {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async connect(): Promise<void> {
    if (!this.state.isMetaMaskInstalled) {
      throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
    }

    try {
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await window.ethereum!.request({
        method: 'eth_chainId',
      });

      this.updateState({
        isConnected: true,
        address: accounts[0],
        chainId,
      });
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('Please connect to MetaMask.');
      }
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  public async disconnect(): Promise<void> {
    this.updateState({
      isConnected: false,
      address: null,
      chainId: null,
    });
    localStorage.removeItem('wallet-state');
  }

  public async switchToEthereum(): Promise<void> {
    if (!this.state.isMetaMaskInstalled) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum mainnet
      });
    } catch (error: any) {
      if (error.code === 4902) {
        throw new Error('Ethereum mainnet is not available in your MetaMask. Please add it manually.');
      }
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }

  public getState(): WalletState {
    return { ...this.state };
  }

  public formatAddress(address: string | null): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export const walletService = new WalletService();