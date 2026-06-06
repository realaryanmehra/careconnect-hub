import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";
import { toast } from "sonner";

const VideoCallModal = ({ isOpen, onClose, roomId, socket }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState("Connecting...");

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    if (!isOpen || !roomId || !socket) return;

    let isComponentMounted = true;

    const initializeCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!isComponentMounted) return;
        
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Handle remote stream
        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setCallStatus("Connected");
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc-ice-candidate", {
              roomId,
              candidate: event.candidate,
            });
          }
        };

        // Socket listeners
        socket.emit("join-consultation-room", roomId);

        socket.on("user-joined", async (userId) => {
          console.log("User joined, creating offer");
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("webrtc-offer", { roomId, offer });
          } catch (err) {
            console.error("Error creating offer:", err);
          }
        });

        socket.on("webrtc-offer", async (data) => {
          try {
            console.log("Received offer");
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("webrtc-answer", { roomId, answer });
          } catch (err) {
            console.error("Error handling offer:", err);
          }
        });

        socket.on("webrtc-answer", async (data) => {
          try {
            console.log("Received answer");
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          } catch (err) {
            console.error("Error handling answer:", err);
          }
        });

        socket.on("webrtc-ice-candidate", async (data) => {
          try {
            if (data.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          } catch (err) {
            console.error("Error adding ice candidate:", err);
          }
        });

        socket.on("user-left", () => {
          toast("The other person left the call.");
          handleEndCall();
        });

        setCallStatus("Waiting for other person...");
      } catch (err) {
        console.error("Error accessing media devices.", err);
        toast.error("Could not access camera or microphone. Please allow permissions.");
        setCallStatus("Failed to access media devices.");
      }
    };

    initializeCall();

    return () => {
      isComponentMounted = false;
      socket.off("user-joined");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice-candidate");
      socket.off("user-left");
      socket.emit("leave-consultation-room", roomId);
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [isOpen, roomId, socket]);

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socket) {
        socket.emit("leave-consultation-room", roomId);
    }
    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleEndCall()}>
      <DialogContent className="max-w-4xl bg-black border-slate-800 text-white sm:max-w-4xl p-1">
        <DialogHeader className="px-6 py-4 absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <DialogTitle>Video Consultation</DialogTitle>
          <DialogDescription className="text-slate-300">
            {callStatus}
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full aspect-video bg-slate-900 rounded-md overflow-hidden">
          {/* Remote Video (Main) */}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          {/* Local Video (PiP) */}
          <div className="absolute top-16 right-4 w-48 aspect-video bg-black rounded-lg overflow-hidden border-2 border-slate-700 shadow-xl z-10">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-sm px-6 py-3 rounded-full z-20 border border-slate-800">
            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400 border-red-500/50' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'}`}
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400 border-red-500/50' : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'}`}
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>

            <Button 
              variant="destructive" 
              size="icon" 
              className="rounded-full bg-red-600 hover:bg-red-700 h-12 w-12 ml-4"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCallModal;
