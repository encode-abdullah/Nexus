import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Send, CreditCard, Wallet, TrendingUp, Clock } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Transaction {
  _id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  recipientId?: { name: string; email: string };
  description?: string;
  createdAt: string;
}

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txRes, balRes] = await Promise.all([
        api.get('/payments/transactions'),
        api.get('/payments/balance')
      ]);
      setTransactions(txRes.data.transactions);
      setBalance(balRes.data.balance);
    } catch {
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      if (activeTab === 'deposit') {
        await api.post('/payments/deposit', { amount: parseFloat(amount) });
        toast.success('Deposit successful');
      } else if (activeTab === 'withdraw') {
        await api.post('/payments/withdraw', { amount: parseFloat(amount) });
        toast.success('Withdrawal successful');
      } else if (activeTab === 'transfer') {
        if (!recipientEmail) {
          toast.error('Please enter recipient email');
          setProcessing(false);
          return;
        }
        // First find user by email
        const usersRes = await api.get('/users');
        const recipient = usersRes.data.users.find((u: any) => u.email === recipientEmail);
        if (!recipient) {
          toast.error('Recipient not found');
          setProcessing(false);
          return;
        }
        await api.post('/payments/transfer', {
          recipientId: recipient._id,
          amount: parseFloat(amount)
        });
        toast.success('Transfer successful');
      }
      setAmount('');
      setRecipientEmail('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Transaction failed');
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft size={20} className="text-green-600" />;
      case 'withdraw': return <ArrowUpRight size={20} className="text-red-600" />;
      case 'transfer': return <Send size={20} className="text-blue-600" />;
      default: return <DollarSign size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'gray';
    }
  };

  if (loading) {
    return <div className="text-center py-12"><p className="text-gray-500">Loading payments...</p></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Manage your funds and transactions</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100">Available Balance</p>
              <h2 className="text-4xl font-bold mt-1">${balance.toFixed(2)}</h2>
              <p className="text-primary-200 mt-2">USD</p>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-full">
              <Wallet size={40} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`cursor-pointer transition-all ${activeTab === 'deposit' ? 'ring-2 ring-primary-500' : ''}`}
          onClick={() => setActiveTab('deposit')}>
          <CardBody className="flex items-center gap-4 p-4">
            <div className="p-3 bg-green-50 rounded-full">
              <ArrowDownLeft size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Deposit</h3>
              <p className="text-sm text-gray-500">Add funds</p>
            </div>
          </CardBody>
        </Card>

        <Card className={`cursor-pointer transition-all ${activeTab === 'withdraw' ? 'ring-2 ring-primary-500' : ''}`}
          onClick={() => setActiveTab('withdraw')}>
          <CardBody className="flex items-center gap-4 p-4">
            <div className="p-3 bg-red-50 rounded-full">
              <ArrowUpRight size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Withdraw</h3>
              <p className="text-sm text-gray-500">Cash out</p>
            </div>
          </CardBody>
        </Card>

        <Card className={`cursor-pointer transition-all ${activeTab === 'transfer' ? 'ring-2 ring-primary-500' : ''}`}
          onClick={() => setActiveTab('transfer')}>
          <CardBody className="flex items-center gap-4 p-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <Send size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Transfer</h3>
              <p className="text-sm text-gray-500">Send to others</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Transaction Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900 capitalize">{activeTab}</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Amount (USD)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            startAdornment={<DollarSign size={18} />}
          />
          {activeTab === 'transfer' && (
            <Input
              label="Recipient Email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
            />
          )}
          <Button
            onClick={handleTransaction}
            isLoading={processing}
            leftIcon={<CreditCard size={18} />}
            fullWidth
          >
            {activeTab === 'deposit' ? 'Deposit Funds' : activeTab === 'withdraw' ? 'Withdraw Funds' : 'Send Transfer'}
          </Button>
        </CardBody>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
        </CardHeader>
        <CardBody>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-full">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">{tx.type}</h3>
                      <p className="text-sm text-gray-500">{tx.description || `${tx.type} transaction`}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {format(new Date(tx.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    <Badge variant={getStatusColor(tx.status) as any} size="sm">{tx.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
