import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import { socket } from "@/lib/socket";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";

const Layout = ({ children }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const location = useLocation();

    useEffect(() => {
        if (!user) return;

        // Listen for when a doctor calls the patient's token
        socket.on('tokenCalled', (data) => {
            // Only notify if it belongs to this user
            if (data.userId === user.id || data.userId === user._id) {
                toast({
                    title: "Doctor is Ready!",
                    description: `Your token #${data.number} is now in progress. Please join the video call.`,
                    duration: 10000,
                    action: (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.location.href = "/tokens"}
                        >
                            Go to Call
                        </Button>
                    ),
                });

                // Play a subtle notification sound
                try {
                    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                    audio.volume = 0.5;
                    audio.play();
                } catch (e) {
                    console.log("Audio play blocked by browser interaction policy");
                }
            }
        });

        // Listen for general token updates (like position moves)
        socket.on('tokenUpdated', (data) => {
          // You could add a subtle toast here too if needed
          console.log('Token updated real-time:', data);
        });

        return () => {
            socket.off('tokenCalled');
            socket.off('tokenUpdated');
        };
    }, [user, toast]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <AnimatePresence mode="wait">
                <motion.main 
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex-1"
                >
                    {children}
                </motion.main>
            </AnimatePresence>
            <Footer />
        </div>
    );
};

export default Layout;
