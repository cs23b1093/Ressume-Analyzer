import React, { useRef, useState } from "react";

export default function ChatWithPdf() {
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState([
		{ id: 1, role: "assistant", text: "Hi — upload your resume (PDF) or ask a question about it." },
	]);
	const [input, setInput] = useState("");
	const [fileName, setFileName] = useState(null);
	const fileRef = useRef(null);
	const messageIdCounter = useRef(messages.length + 1);

	function toggleOpen() {
		setOpen((v) => !v);
	}

	function handleFileChange(e) {
		const f = e.target.files && e.target.files[0];
		if (!f) return;
		setFileName(f.name);
		setMessages((m) => [
			...m,
			{ id: messageIdCounter.current++, role: "user", text: `Uploaded ${f.name}` },
		]);
		// In a real app: upload file to server or pass to parser here
	}

	function onSend() {
		if (!input.trim()) return;
		const text = input.trim();
		setMessages((m) => [...m, { id: messageIdCounter.current++, role: "user", text }] );
		setInput("");

		// fake assistant reply for demo
		setTimeout(() => {
			setMessages((m) => [
				...m,
				{ id: messageIdCounter.current++, role: "assistant", text: `Got it — I received: "${text}"${fileName ? ` (resume: ${fileName})` : ''}` },
			]);
		}, 600);
	}

	return (
		<div className="relative">
			{/* Floating button */}
			<div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
				<div
					className={`px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-full shadow-lg transition-all duration-200 ${open ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
				>
					Free
				</div>
				<button
					onClick={toggleOpen}
					aria-label="Chat with PDF"
					className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl hover:scale-105 transition-transform"
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.864 9.864 0 01-3.89-.77L3 20l1.23-3.44A7.975 7.975 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
				</button>
			</div>

			{/* Chat panel */}
			<div
				className={`fixed bottom-24 right-6 z-40 w-96 max-w-full transform transition-all duration-200 ${open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'}`}
			>
				<div className="flex flex-col h-96 bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5">
					<div className="flex items-center justify-between px-4 py-3 border-b">
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">R</div>
							<div>
								<div className="flex items-center gap-2">
									<div className="text-sm font-medium">Chat with PDF</div>
									<span className="px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Free</span>
								</div>
								<div className="text-xs text-slate-500">Ask questions about your resume</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<label className="inline-flex items-center gap-2 cursor-pointer px-3 py-1 rounded-md hover:bg-slate-50">
								<input ref={fileRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
								</svg>
								<span className="text-xs text-slate-600">Upload</span>
							</label>
							<button onClick={toggleOpen} className="p-2 rounded-md hover:bg-slate-100">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>

					<div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
						{messages.map((m) => (
							<div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
								<div className={`${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white ring-1 ring-black/5 text-slate-800'} max-w-[80%] px-3 py-2 rounded-lg`}> 
									<div className="text-sm">
										{m.text}
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="px-3 py-3 border-t bg-white">
						<div className="flex items-center gap-2">
							<button
								onClick={() => fileRef.current?.click()}
								className="p-2 rounded-md hover:bg-slate-50"
								title="Upload PDF"
							>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
							</button>

							<input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }}
								placeholder={fileName ? `Ask about ${fileName} or type a question...` : 'Type a message or upload a resume (PDF)'}
								className="flex-1 px-3 py-2 rounded-full border bg-white text-sm outline-none focus:ring-1 focus:ring-indigo-300"
							/>

							<button
								onClick={onSend}
								className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm hover:brightness-110"
							>
								Send
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
