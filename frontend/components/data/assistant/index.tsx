'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatStore } from '@/store/assistant';
import { BetweenVerticalEnd, Loader2, MessageSquareX, Send } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import Topbar from '@/components/common/top-bar';
// import { PreviewPageSideBar } from '../overview/preview-sidebar';

const ChatPage = ({ workspaceId, datasetId }: { workspaceId: string; datasetId: string }) => {
    const { data: me, isLoading: meLoading } = useProfile();
    const [message, setMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { addChats, getChats, chats, isChatLoading, isMessageSending }: any = useChatStore();
    // const [isFirstMessage, setIsFirstMessage] = useState(chats.length === 0);

    useEffect(() => {
        if (datasetId && workspaceId) {
            getChats(datasetId, workspaceId);
        }
    }, [datasetId, workspaceId, getChats]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chats]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chats]);


    const handleMessageSend = (text = message) => {
        if (text.trim()) {
            addChats(datasetId, workspaceId, text, me?.name);
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleMessageSend();
        }
    };

    const dummyPrompts = [
        "Describe data.",
        "Plot distribution charts for all numeric columns.",
    ];

    return (
        <>
            {chats.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center flex-col">
                    <h1 className="text-3xl font-bold text-center mb-8">{"Ask Me :)"}</h1>
                    <div className="relative mb-4">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask me anything..."
                            className="pr-12 h-14 w-[50rem] rounded-full bg-white dark:bg-white/10 border-2 border-primary text-foreground placeholder:text-muted-foreground"
                        />
                        <Button
                            onClick={() => handleMessageSend()}
                            size="icon"
                            className="absolute right-2 top-2 rounded-full bg-primary hover:bg-primary/90 h-10 w-10"
                            disabled={!message.trim()}
                        >
                            <Send className="h-5 w-5 text-white" />
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        {dummyPrompts.map((prompt, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="justify-start text-left h-auto py-2 px-4"
                                onClick={() => handleMessageSend(prompt)}
                            >
                                {prompt}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto  px-8 py-8" ref={chatContainerRef} style={{
                        scrollbarWidth: "none",
                    }}>
                        {isChatLoading ? (
                            <ChatSkeleton />
                        ) : chats.length > 0 ? (
                            chats.map((item, index) => (
                                <ChatMessage key={index} item={item} me={me} />
                            ))
                        ) : (
                            <EmptyChatState />
                        )}
                        {isMessageSending && <TypingIndicator />}
                    </div>
                    <div className="sticky bottom-0 p-4 border-t bg-background">
                        <div className="max-w-3xl mx-auto relative">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type your message..."
                                className="w-full pr-12 h-12 rounded-full bg-white dark:bg-white/10 border-2 border-primary text-foreground placeholder:text-muted-foreground"
                            />
                            <Button
                                onClick={() => handleMessageSend()}
                                size="icon"
                                className="absolute right-2 top-1 rounded-full bg-primary hover:bg-primary/90 h-10 w-10"
                                disabled={!message.trim()}
                            >
                                <Send className="h-5 w-5 text-white" />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

const ChatSkeleton = () => (
    <>
        {Array(3).fill(null).map((_, index) => (
            <div key={index} className="flex items-start gap-4 mb-4 animate-pulse">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-full max-w-[300px]" />
                </div>
            </div>
        ))}
    </>
);

const ChatMessage = ({ item, me }) => (
    <div className="flex items-start gap-4 mb-4 justify-start">
        {item?.speaker === me?.name ? (
            <>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={me?.picture} alt="User Avatar" />
                    <AvatarFallback>{me?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-sm text-muted-foreground">{item.speaker}</span>
                    <span className="text-sm bg-primary/10 rounded-lg p-3 mt-1 inline-block">{item.message}</span>
                </div>
            </>
        ) : (
            <>
                <div className="bg-gradient-to-br from-primary to-primary-foreground h-10 w-10 flex items-center justify-center rounded-full shadow-md">
                    <BetweenVerticalEnd size={20} className='text-white' />
                </div>
                <div className="flex flex-col flex-1 overflow-auto" style={{
                    scrollbarWidth: "none",
                }}>
                    <span className="font-semibold text-sm text-primary">Assistant</span>
                    <div className="text-sm bg-secondary/20 border rounded-lg p-3 mt-1 shadow-sm w-fit">
                        {typeof item.message === 'string' ? (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: item?.message?.replace(/\*\*/g, '<strong>').replace(/\*/g, '</strong>'),
                                }}
                            />
                        ) : null}
                    </div>
                </div>
            </>
        )}
    </div>
);

const EmptyChatState = () => (
    <div className="h-full flex items-center justify-center">
        <div className="text-center">
            <MessageSquareX className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-2 text-lg font-semibold text-foreground">No messages</h2>
            <p className="mt-1 text-sm text-muted-foreground">Get started by sending a message.</p>
        </div>
    </div>
);

const TypingIndicator = () => (
    <div className="flex items-center gap-4 mb-4">
        <div className="bg-gradient-to-br from-primary to-primary-foreground h-10 w-10 animate-pulse flex items-center justify-center rounded-full shadow-md">
            <BetweenVerticalEnd size={20} className='text-white' />
        </div>
        <Loader2 size={20} className='animate-spin text-primary' />
    </div>
);

export default ChatPage;

