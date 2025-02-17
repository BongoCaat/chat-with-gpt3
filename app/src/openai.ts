import EventEmitter from "events";
import { Configuration, OpenAIApi } from "openai";
import SSE from "./sse";
import { OpenAIMessage, Parameters } from "./types";

export const defaultSystemPrompt = `
Eres ChatGPT, un modelo de lenguaje grande entrenado por OpenAI.
Fecha y hora actual: {{ datetime }}
`.trim();

export const defaultModel = 'gpt-3.5-turbo';

export interface OpenAIResponseChunk {
    id?: string;
    done: boolean;
    choices?: {
        delta: {
            content: string;
        };
        index: number;
        finish_reason: string | null;
    }[];
    model?: string;
}

function parseResponseChunk(buffer: any): OpenAIResponseChunk {
    const chunk = buffer.toString().replace('data: ', '').trim();

    if (chunk === '[DONE]') {
        return {
            done: true,
        };
    }

    const parsed = JSON.parse(chunk);

    return {
        id: parsed.id,
        done: false,
        choices: parsed.choices,
        model: parsed.model,
    };
}

export async function createChatCompletion(messages: OpenAIMessage[], parameters: Parameters): Promise<string> {
    if (!parameters.apiKey) {
        throw new Error('No se proporcionó ninguna clave de API');
    }

    const configuration = new Configuration({
        apiKey: parameters.apiKey,
    });

    const openai = new OpenAIApi(configuration);

    const response = await openai.createChatCompletion({
        model: parameters.model,
        temperature: parameters.temperature,
        messages: messages as any,
    });

    return response.data.choices[0].message?.content?.trim() || '';
}

export async function createStreamingChatCompletion(messages: OpenAIMessage[], parameters: Parameters) {
    if (!parameters.apiKey) {
        throw new Error('No se proporcionó ninguna clave de API');
    }

    const emitter = new EventEmitter();

    const messagesToSend = [...messages].filter(m => m.role !== 'app');

    for (let i = messagesToSend.length - 1; i >= 0; i--) {
        const m = messagesToSend[i];
        if (m.role === 'user') {
            break;
        }
        if (m.role === 'assistant') {
            messagesToSend.splice(i, 1);
        }
    }

    messagesToSend.unshift({
        role: 'system',
        content: (parameters.initialSystemPrompt || defaultSystemPrompt).replace('{{ datetime }}', new Date().toLocaleString()),
    });

    const eventSource = new SSE('https://api.openai.com/v1/chat/completions', {
        method: "POST",
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Authorization': `Bearer ${parameters.apiKey}`,
            'Content-Type': 'application/json',
        },
        payload: JSON.stringify({
            "model": parameters.model,
            "messages": messagesToSend,
            "temperature": parameters.temperature,
            "stream": true,
        }),
    }) as SSE;

    // TODO: enable (optional) server-side completion
    /*
    const eventSource = new SSE('/chatapi/completion/streaming', {
        method: "POST",
        headers: {
            'Accept': 'application/json, text/plain, *\/*',
            'Authorization': `Bearer ${parameters.apiKey}`,
            'Content-Type': 'application/json',
        },
        payload: JSON.stringify({
            "model": parameters.model,
            "messages": messagesToSend,
            "temperature": parameters.temperature,
            "stream": true,
        }),
    }) as SSE;
    */

    let contents = '';

    eventSource.addEventListener('error', (event: any) => {
        if (!contents) {
            let error = event.data;
            try {
                error = JSON.parse(error).error.message;
            } catch (e) {}
            emitter.emit('error', error);
        }
    });

    eventSource.addEventListener('message', async (event: any) => {

        if (event.data === '[DONE]') {
            emitter.emit('done');
            return;
        }

        try {
            const chunk = parseResponseChunk(event.data);
            if (chunk.choices && chunk.choices.length > 0) {
                contents += chunk.choices[0]?.delta?.content || '';
                emitter.emit('data', contents);
            }
        } catch (e) {
            console.error(e);
        }
    });

    eventSource.stream();

    return {
        emitter,
        cancel: () => eventSource.close(),
    };
}