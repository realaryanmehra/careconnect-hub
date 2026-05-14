import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, ShieldCheck, Loader2, Info, QrCode, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { processDemoPayment } from "@/lib/api";
import { toast } from "sonner";

const PaymentModal = ({ isOpen, onClose, token, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242'); // Demo card

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await processDemoPayment(token.id || token._id);
      if (response.success) {
        toast.success("Payment Successful!", {
          description: "Your consultation fee has been paid (Demo Mode)."
        });
        onSuccess(token.id || token._id);
        onClose();
      }
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("Payment failed", {
        description: error.message || "Could not process demo payment."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> 
            Consultation Fee
          </DialogTitle>
          <DialogDescription>
            You are in <strong>Demo Mode</strong>. No real money will be charged.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2 max-h-[60vh] scrollbar-thin">
          <div className="space-y-6">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Consultation For</span>
              <span className="font-medium text-foreground">{token?.department}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Token Number</span>
              <span className="font-medium text-foreground">#{token?.number}</span>
            </div>
            <div className="pt-2 border-t border-primary/10 flex justify-between items-center">
              <span className="font-bold text-foreground">Total Amount</span>
              <span className="text-xl font-bold text-primary">$50.00</span>
            </div>
          </div>

          <Tabs defaultValue="card" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card" className="gap-2">
                <CreditCard className="h-4 w-4" /> Card
              </TabsTrigger>
              <TabsTrigger value="upi" className="gap-2">
                <Smartphone className="h-4 w-4" /> UPI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Card Number (Simulated)</Label>
                <div className="relative">
                  <Input 
                    value={cardNumber} 
                    readOnly 
                    className="bg-muted/50 font-mono tracking-widest"
                  />
                  <ShieldCheck className="absolute right-3 top-2.5 h-5 w-5 text-success opacity-50" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry</Label>
                  <Input value="12/28" readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>CVC</Label>
                  <Input value="123" readOnly className="bg-muted/50" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upi" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>UPI ID</Label>
                <Input placeholder="username@upi" defaultValue="demo@okicici" className="bg-muted/50" readOnly />
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-dashed border-slate-200">
                <QrCode className="h-24 w-24 text-slate-400 mb-2" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Scan to Pay (Simulated)</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-800">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              This is a simulated payment gateway. Clicking 'Pay Now' will instantly mark your token as 'Paid' in the database.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter className="p-6 pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={loading} className="min-w-[120px]">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Processing...
              </>
            ) : (
              "Pay Now $50.00"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
