# This is a simple example of a chainlit app.
import chainlit as cl

commands = [
    {"id": "Picture", "icon": "image", "description": "Use DALL-E"},
    {"id": "Search", "icon": "globe", "description": "Find on the web"},
    {
        "id": "Canvas",
        "icon": "pen-line",
        "description": "Collaborate on writing and code",
    },
]

@cl.on_chat_start
async def start():
    await cl.context.emitter.set_commands(commands)


@cl.on_message
async def main(message: cl.Message):

    if message.command:
        await cl.Message(
            content=f"You used the chat command: '{message}'"
        )
    
    # Send a response back to the user
    await cl.Message(
        content=message.content
    ).send()
