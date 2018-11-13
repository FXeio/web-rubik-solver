export class Message {
    action: string;
    content: string;
    constructor(action: string, content: string) {
        this.action = action;
        this.content = content;
    }
}
