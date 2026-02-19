import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const ChatInput = ({ 
  onSend, 
  onStartAudio, 
  onStopAudio, 
  isListening, 
  isProcessing 
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAudioToggle = () => {
    if (isListening) {
      onStopAudio();
    } else {
      onStartAudio();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <Textarea
        placeholder="Type your message or use voice..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        className="min-h-[44px] max-h-[120px] resize-none"
        rows={1}
        disabled={isListening || isProcessing}
      />
      
      <Button 
        onClick={handleSend} 
        size="icon"
        disabled={!message.trim() || isListening || isProcessing}
      >
        <Send className="w-4 h-4" />
      </Button>

      <Button
        onClick={handleAudioToggle}
        size="icon"
        variant={isListening ? 'destructive' : 'outline'}
        disabled={isProcessing}
      >
        {console.log(isProcessing,"isProcessing")
        }
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-2 text-muted-foreground text-sm"
          >
            <span>Listening...</span>
            <div className="flex items-end gap-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-red-500 rounded-full w-1"
                  animate={{ height: [6, 16, 6] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInput;
