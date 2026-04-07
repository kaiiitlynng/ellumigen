import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { GitBranch, Copy, ThumbsUp, ThumbsDown, Bookmark } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import type { Chat, ChatMessage, BookmarkCollection } from "@/types/chat";
import { ChatInput } from "./ChatInput";
import { SuggestionChips } from "./SuggestionChips";
import { ContextTags } from "./chat/ContextTags";
import { ProposedPlan } from "./chat/ProposedPlan";
import { TaskExecution } from "./chat/TaskExecution";
import { ThoughtProcess } from "./chat/ThoughtProcess";
import { ContextControlHelp } from "./chat/ContextControlHelp";
import { DataTable } from "./chat/DataTable";
import { VolcanoPlot } from "./chat/VolcanoPlot";
import { HeatmapChart } from "./chat/HeatmapChart";
import { DraggableVisualization } from "./chat/DraggableVisualization";
import { BookmarkPopover } from "./chat/BookmarkPopover";

interface ChatViewProps {
  chat: Chat | null;
  onSendMessage: (message: string) => void;
  onBranch?: (messageIndex: number) => void;
  onBookmark?: (messageId: string) => void;
  onToggleBookmarkCollection?: (messageId: string, collectionId: string) => void;
  onCreateBookmarkCollection?: (name: string) => void;
  getCollectionIdsForMessage?: (messageId: string) => string[];
  bookmarkCollections?: BookmarkCollection[];
  onApprovePlan?: (messageId: string) => void;
  onRejectPlan?: (messageId: string) => void;
  isLoading?: boolean;
  showContextHelp?: boolean;
  onToggleContextHelp?: (show: boolean) => void;
}

export function ChatView({
  chat,
  onSendMessage,
  onBranch,
  onBookmark,
  onToggleBookmarkCollection,
  onCreateBookmarkCollection,
  getCollectionIdsForMessage,
  bookmarkCollections,
  onApprovePlan,
  onRejectPlan,
  isLoading,
  showContextHelp,
  onToggleContextHelp,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.messages, chat?.messages.length]);

  const isEmpty = !chat || chat.messages.length === 0;

  const handleSend = (message: string) => {
    if (message.toLowerCase().includes("help")) {
      onToggleContextHelp?.(true);
    }
    onSendMessage(message);
  };

  return (
    <div className="flex flex-col h-full">
      {isEmpty ? (
        <div className="flex-1 flex flex-col justify-end px-6 pb-12">
          <div className="w-full max-w-xl mx-auto">
            <ChatInput
              onSend={handleSend}
              disabled={isLoading}
              onHelpClick={() => onToggleContextHelp?.(true)}
            />
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
            <div className="max-w-3xl mx-auto space-y-6 pb-12">
              <AnimatePresence initial={false}>
                {chat.messages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onBranch={() => onBranch?.(i)}
                    onBookmark={() => onBookmark?.(msg.id)}
                    onToggleBookmarkCollection={onToggleBookmarkCollection ? (colId: string) => onToggleBookmarkCollection(msg.id, colId) : undefined}
                    onCreateBookmarkCollection={onCreateBookmarkCollection}
                    activeCollectionIds={getCollectionIdsForMessage?.(msg.id) ?? []}
                    bookmarkCollections={bookmarkCollections ?? []}
                    onApprovePlan={() => onApprovePlan?.(msg.id)}
                    onRejectPlan={() => onRejectPlan?.(msg.id)}
                  />
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1 py-4"
                >
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </motion.div>
              )}

              {/* Context control help */}
              <AnimatePresence>
                {showContextHelp && (
                  <ContextControlHelp onClose={() => onToggleContextHelp?.(false)} />
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="sticky bottom-0 bg-background border-t border-border px-6 pb-4 pt-3">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSend={handleSend}
                disabled={isLoading}
                onHelpClick={() => onToggleContextHelp?.(true)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  onBranch,
  onBookmark,
  onToggleBookmarkCollection,
  onCreateBookmarkCollection,
  activeCollectionIds,
  bookmarkCollections,
  onApprovePlan,
  onRejectPlan,
}: {
  message: ChatMessage;
  onBranch: () => void;
  onBookmark: () => void;
  onToggleBookmarkCollection?: (collectionId: string) => void;
  onCreateBookmarkCollection?: (name: string) => void;
  activeCollectionIds: string[];
  bookmarkCollections: BookmarkCollection[];
  onApprovePlan?: () => void;
  onRejectPlan?: () => void;
}) {
  const isUser = message.role === "user";
  const metaType = message.metadata?.type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} gap-3`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
          AI
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? "" : ""}`}>
        {isUser ? (
          <div>
            <div className="bg-foreground text-background rounded-2xl rounded-br-md px-4 py-3">
              <p className="text-sm" dangerouslySetInnerHTML={{
                __html: message.content.replace(
                  /\/([\w-]+)/g,
                  '<span class="text-violet-300 font-medium">/$1</span>'
                ),
              }} />
            </div>
          </div>
        ) : metaType === "plan" && message.metadata?.plan ? (
          <ProposedPlan
            plan={message.metadata.plan}
            onApprove={() => onApprovePlan?.()}
            onReject={() => onRejectPlan?.()}
            onEdit={() => {}}
          />
        ) : metaType === "executing" ? (
          <div className="w-full">
            {message.metadata?.thoughtProcess && message.metadata.thoughtProcess.length > 0 && (
              <ThoughtProcess
                entries={message.metadata.thoughtProcess}
                isLive={message.metadata.executionSteps?.some(s => s.status === "running")}
              />
            )}
            {message.metadata?.executionSteps && (
              <TaskExecution
                steps={message.metadata.executionSteps}
                completedCount={message.metadata.executionSteps.filter(s => s.status === "complete").length}
                totalCount={message.metadata.executionSteps.length}
              />
            )}
          </div>
        ) : metaType === "data-table" && message.metadata?.dataTable ? (
          <div className="w-full">
            {message.content && (
              <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground mb-4">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}
            <DataTable
              columns={message.metadata.dataTable.columns}
              data={message.metadata.dataTable.data}
            />
          </div>
        ) : metaType === "visualizations" ? (
          <div className="w-full space-y-4">
            {message.content && (
              <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}
            {message.metadata?.dataTable && (
              <DraggableVisualization type="datatable" title="Data Table">
                <DataTable
                  columns={message.metadata.dataTable.columns}
                  data={message.metadata.dataTable.data}
                />
              </DraggableVisualization>
            )}
            {message.metadata?.showVolcano && (
              <DraggableVisualization type="volcano" title="Volcano Plot">
                <VolcanoPlot />
              </DraggableVisualization>
            )}
            {message.metadata?.showHeatmap && (
              <DraggableVisualization type="heatmap" title="Expression Heatmap">
                <HeatmapChart />
              </DraggableVisualization>
            )}
          </div>
        ) : (
          <div>
            {/* Context used badges */}
            {message.metadata?.contextUsed && message.metadata.contextUsed.length > 0 && (
              <ContextTags tags={message.metadata.contextUsed} variant="assistant" />
            )}
            <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground">
              <ReactMarkdown
                components={{
                  p: ({ children }) => {
                    const processNode = (node: React.ReactNode): React.ReactNode => {
                      if (typeof node === 'string') {
                        const parts = node.split(/(\/[\w-]+)/g);
                        if (parts.length === 1) return node;
                        return <>{parts.map((part, i) =>
                          /^\/[\w-]+$/.test(part)
                            ? <span key={i} className="text-violet-500 font-medium">{part}</span>
                            : part
                        )}</>;
                      }
                      return node;
                    };
                    const processed = Array.isArray(children) ? children.map(processNode) : processNode(children);
                    return <p>{processed}</p>;
                  },
                }}
              >{message.content}</ReactMarkdown>


              <div className="flex items-center gap-1 mt-3 -ml-1">
                <button className="p-1 rounded hover:bg-secondary transition-colors">
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button className="p-1 rounded hover:bg-secondary transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button className="p-1 rounded hover:bg-secondary transition-colors">
                  <ThumbsDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={onBookmark}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                  title={message.bookmarked ? "Remove bookmark" : "Bookmark"}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${message.bookmarked ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                </button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onBranch}
                        className="p-1 rounded hover:bg-secondary transition-colors"
                      >
                        <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Branch</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
          U
        </div>
      )}
    </motion.div>
  );
}
