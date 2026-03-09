import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, CreditCard, Lock, Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
  workerShare: number;
  platformCommission: number;
  serviceName: string;
  workerName: string;
  paymentType?: 'service' | 'cancellation';
  onPaymentSuccess: (paymentData: any) => void;
}

type PaymentStep = 'form' | 'processing' | 'success' | 'failed';

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  amount,
  workerShare,
  platformCommission,
  serviceName,
  workerName,
  paymentType = 'service',
  onPaymentSuccess,
}) => {
  const [step, setStep] = useState<PaymentStep>('form');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [error, setError] = useState('');
  const [paymentResult, setPaymentResult] = useState<any>(null);

  if (!isOpen) return null;

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    return cleaned;
  };

  const getCardBrand = () => {
    const num = cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5') || num.startsWith('2')) return 'mastercard';
    if (num.startsWith('3')) return 'amex';
    return null;
  };

  const isFormValid = () => {
    const num = cardNumber.replace(/\s/g, '');
    return num.length >= 13 && cardExpiry.length === 5 && cardCvv.length >= 3 && cardHolder.length >= 2;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setError('');
    setStep('processing');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('process-payment', {
        body: {
          booking_id: bookingId,
          card_number: cardNumber.replace(/\s/g, ''),
          card_expiry: cardExpiry,
          card_cvv: cardCvv,
          card_holder: cardHolder,
          payment_type: paymentType,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      setPaymentResult(data.payment);
      setStep('success');
      onPaymentSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setStep('failed');
    }
  };

  const handleClose = () => {
    setStep('form');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardHolder('');
    setError('');
    setPaymentResult(null);
    onClose();
  };

  const brand = getCardBrand();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Processing State */}
        {step === 'processing' && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={40} className="text-red-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-500">Please wait while we securely process your payment...</p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Lock size={12} />
              <span>256-bit SSL encrypted</span>
            </div>
          </div>
        )}

        {/* Success State */}
        {step === 'success' && (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-500">Your payment has been processed securely.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Reference</span>
                <span className="font-mono font-semibold text-gray-900">{paymentResult?.reference}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Invoice</span>
                <span className="font-mono font-semibold text-gray-900">{paymentResult?.invoice_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-green-600">R{paymentResult?.amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Card</span>
                <span className="font-medium text-gray-900">{paymentResult?.card_brand} ****{paymentResult?.card_last_four}</span>
              </div>
              {paymentType === 'service' && (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-xs text-gray-400 mb-2">Payment Split</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Worker ({workerName})</span>
                      <span className="font-medium text-gray-700">R{paymentResult?.worker_share?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Platform Fee</span>
                      <span className="font-medium text-gray-700">R{paymentResult?.platform_commission?.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition"
            >
              Done
            </button>
          </div>
        )}

        {/* Failed State */}
        {step === 'failed' && (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={40} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Payment Failed</h3>
              <p className="text-gray-500">{error || 'Something went wrong. Please try again.'}</p>
            </div>

            <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100">
              <p className="text-sm text-red-700">
                Your card was not charged. Please check your card details and try again, or use a different payment method.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { setStep('form'); setError(''); }}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {step === 'form' && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white relative">
              <button onClick={handleClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition">
                <X size={24} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Lock size={16} className="text-green-400" />
                <span className="text-xs text-green-400 font-medium">Secure Checkout</span>
              </div>
              <h2 className="text-xl font-bold">
                {paymentType === 'cancellation' ? 'Pay Cancellation Fee' : 'Complete Payment'}
              </h2>
              <p className="text-gray-400 text-sm mt-1">{serviceName} {workerName ? `with ${workerName}` : ''}</p>
            </div>

            {/* Amount Summary */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">
                  {paymentType === 'cancellation' ? 'Cancellation Fee' : 'Total Amount'}
                </span>
                <span className="text-2xl font-black text-gray-900">R{amount.toFixed(2)}</span>
              </div>
              {paymentType === 'service' && (
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                  <span>Worker: R{workerShare.toFixed(2)}</span>
                  <span>Platform: R{platformCommission.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Card Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Holder Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="Full name on card"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
                <div className="relative">
                  <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full pl-12 pr-20 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition font-mono"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className={`w-8 h-5 rounded border flex items-center justify-center text-[8px] font-bold transition ${brand === 'visa' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-400'}`}>
                      VISA
                    </div>
                    <div className={`w-8 h-5 rounded border flex items-center justify-center text-[8px] font-bold transition ${brand === 'mastercard' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-400'}`}>
                      MC
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition font-mono"
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition font-mono"
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid()}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg shadow-red-200"
              >
                <Lock size={18} />
                Pay R{amount.toFixed(2)}
              </button>

              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Shield size={12} />
                  <span>PCI DSS Compliant</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Lock size={12} />
                  <span>256-bit SSL</span>
                </div>
              </div>

              <p className="text-xs text-center text-gray-400 leading-relaxed">
                By clicking Pay, you authorise Red Face Home Services to charge your card. 
                {paymentType === 'service' 
                  ? ' Payment will be split between the worker and platform.'
                  : ' This cancellation fee is non-refundable.'}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
