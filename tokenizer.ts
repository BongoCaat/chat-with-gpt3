import { OpenAIMessage } from "./types";

let enc: any;

setTimeout(async () => {
    const { encoding_for_model } = await import(/* webpackChunkName: "tiktoken" */ "./tiktoken/dist/tiktoken");
    enc = encoding_for_model("gpt-3.5-turbo");
}, 2000);

export function getTokenCount(input: string): number {
    return enc.encode(input).length;
}

export function shortenStringToTokenCount(input: string, targetTokenCount: number) {
    const tokens = enc.encode(input);
    const buffer = enc.decode(tokens.slice(0, targetTokenCount));
    return new TextDecoder().decode(buffer) + "(...)";
}

function serializeChatMLMessage(role: string, content: string) {
    const encodedContent = JSON.stringify(content)
        .replace(/^"/g, '').replace(/"$/g, '');

    let chatml = '';
    chatml += `{"token": "<|im_start|>"},\n `;
    chatml += `"${role.toLocaleLowerCase}\\n${encodedContent}",\n `;
    chatml += `{"token": "<|im_end|>"}, "\\n"`;

    return chatml;
}

export function getTokenCountForMessages(messages: OpenAIMessage[]): number {
    let chatml = '[\n';
    for (let i = 0; i < messages.length; i++) {
        const m = messages[i];
        const serializeMessage = serializeChatMLMessage(m.role, m.content);

        chatml += ' ' + serializeMessage;

        if (i < messages.length - 1) {
            chatml += ',';
        }
        chatml += '\n';
    }
    chatml += ']';
    return getTokenCount(chatml);
}

export function selectMessagesToSendSafely(messages: OpenAIMessage[]) {
    const maxTokens = 4096;

    let tokenCount = getTokenCountForMessages(messages);

    if (tokenCount <= maxTokens) {
        return messages;
    }

    let output = [...messages];
    let removed = false;

    // first, remove items in the 'middle' of the conversation until we're under the limit
    for (let i = output.length - 2; i > 0 && tokenCount > maxTokens; i--) {
        tokenCount -= getTokenCount(serializeChatMLMessage(output[i].role, output[i].content));
        output.splice(i, 1);
        removed = true;
    }

    // if we're still over the limit, trim message contents from oldest to newest (excluding the latest)
    if (tokenCount > maxTokens) {
        for (let i = 0; i < output.length - 1 && tokenCount > maxTokens; i++) {
            const oldContent = output[i].content;
            const shortenedContent = shortenStringToTokenCount(oldContent, 20);

            if (shortenedContent !== oldContent) {
                tokenCount -= getTokenCount(serializeChatMLMessage(output[i].role, oldContent));
                tokenCount += getTokenCount(serializeChatMLMessage(output[i].role, shortenedContent));
                output[i].content = shortenedContent;
                removed = true;
            }
        }
    }

    // if that still didn't work, just keep the system prompt and the latest message (truncated as needed)
    if (tokenCount > maxTokens) {
        const systemMessage = output.find(m => m.role === 'system')!;
        const latestMessage = { ...messages[messages.length - 1] };
        output = [systemMessage, latestMessage];
        removed = true;
        
        const excessTokens = Math.max(0, tokenCount - maxTokens);

        if (excessTokens) {
            const tokens = enc.encode(latestMessage.content);
            const buffer = enc.decode(tokens.slice(0, Math.max(0, tokens.length - excessTokens)));
            latestMessage.content = new TextDecoder().decode(buffer);
            tokenCount = maxTokens;
        }
    }

    if (removed) {
        output.splice(1, 0, {
            role: 'system',
            content: 'Several messages not included due to space constraints',
        });
    }

    return output;
}