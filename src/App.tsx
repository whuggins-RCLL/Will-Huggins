import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SLS = { red:"#8C1515", redDk:"#6B0F0F", redLt:"#B83A3A", warm:"#2E2D29", cool:"#53565A", sand:"#D2C295", fog:"#DAD7CB", cream:"#FAF9F6", parch:"#F4F1EB" };

const themes = {
  A: { name:"Classic Institutional", desc:"Serif headings, structured layouts, sandstone accents, formal academic tone", css:{
    pageBg:"#FFFFFF", heroGrad:`linear-gradient(135deg,${SLS.warm} 0%,${SLS.red} 100%)`, heroRadius:"0", heroExtra:`border-bottom:4px solid ${SLS.sand}`,
    fontHead:"Georgia,'Times New Roman',serif", fontBody:"'Segoe UI',system-ui,sans-serif",
    cardBg:"#FFF", cardBorder:`2px solid ${SLS.fog}`, cardRadius:"4px", cardShadow:"none",
    btnRadius:"4px", quoteBg:SLS.parch, quoteBorder:`4px solid ${SLS.red}`, quoteRadius:"0",
    divider:`2px solid ${SLS.fog}`, iconBg:SLS.parch, iconColor:SLS.red, textColor:"#1F2937", mutedColor:"#6B7280", linkColor:SLS.red,
    cardSimpleBg: SLS.parch, cardFeatureBg: SLS.red, cardFeatureText: "#FFF", cardActionBg: "#FFF" }},
  B: { name:"Modern Minimal", desc:"Generous whitespace, rounded shapes, pill buttons, airy contemporary feel", css:{
    pageBg:"#FAFAFA", heroGrad:`linear-gradient(160deg,${SLS.warm} 0%,${SLS.cool} 100%)`, heroRadius:"0 0 32px 32px", heroExtra:"",
    fontHead:"system-ui,-apple-system,'Helvetica Neue',sans-serif", fontBody:"system-ui,-apple-system,sans-serif",
    cardBg:"#FFF", cardBorder:"1px solid #E5E7EB", cardRadius:"16px", cardShadow:"0 1px 3px rgba(0,0,0,0.06)",
    btnRadius:"999px", quoteBg:"#F9FAFB", quoteBorder:`3px solid ${SLS.red}`, quoteRadius:"0 12px 12px 0",
    divider:"1px solid #E5E7EB", iconBg:"#FEF2F2", iconColor:SLS.red, textColor:"#1F2937", mutedColor:"#6B7280", linkColor:SLS.red,
    cardSimpleBg: "#FFF", cardFeatureBg: SLS.warm, cardFeatureText: "#FFF", cardActionBg: "#FFF" }},
  C: { name:"Bold Editorial", desc:"Dramatic large-scale typography, sharp edges, magazine-inspired layouts", css:{
    pageBg:"#FFFFFF", heroGrad:SLS.red, heroRadius:"0", heroExtra:"",
    fontHead:"Georgia,'Playfair Display',serif", fontBody:"system-ui,sans-serif",
    cardBg:"#FFF", cardBorder:"none", cardRadius:"0", cardShadow:"0 4px 20px rgba(0,0,0,0.1)",
    btnRadius:"0", quoteBg:SLS.red, quoteBorder:"none", quoteRadius:"0", quoteColor:"#FFF",
    divider:`3px solid ${SLS.warm}`, iconBg:SLS.red, iconColor:"#FFF", textColor:"#1F2937", mutedColor:"#6B7280", linkColor:SLS.red, headScale:1.2,
    cardSimpleBg: "#F3F4F6", cardFeatureBg: SLS.red, cardFeatureText: "#FFF", cardActionBg: "#FFF" }},
  D: { name:"Warm & Approachable", desc:"Soft rounded shapes, cream backgrounds, gentle shadows, community-friendly", css:{
    pageBg:SLS.cream, heroGrad:`linear-gradient(135deg,${SLS.red} 0%,${SLS.redLt} 50%,#C25B5B 100%)`, heroRadius:"24px", heroMargin:"16px", heroExtra:"",
    fontHead:"'Segoe UI',system-ui,sans-serif", fontBody:"'Segoe UI',system-ui,sans-serif",
    cardBg:"#FFF", cardBorder:"1px solid #E8E3DA", cardRadius:"20px", cardShadow:"0 2px 12px rgba(0,0,0,0.04)",
    btnRadius:"12px", quoteBg:"#FFF9F0", quoteBorder:`4px solid ${SLS.sand}`, quoteRadius:"0 16px 16px 0",
    divider:`1px dashed ${SLS.fog}`, iconBg:"#FFF5F5", iconColor:SLS.red, textColor:"#1F2937", mutedColor:"#6B7280", linkColor:SLS.red,
    cardSimpleBg: "#FFF9F0", cardFeatureBg: SLS.redLt, cardFeatureText: "#FFF", cardActionBg: "#FFF" }},
  E: { name:"Stanford Heritage", desc:"Deep parchment tones, gold accents, ornamental dividers, prestige aesthetic", css:{
    pageBg:"#FAF7F2", heroGrad:`linear-gradient(145deg,${SLS.warm} 0%,${SLS.red} 60%,#A33030 100%)`, heroRadius:"0", heroExtra:`border-bottom:6px solid ${SLS.sand}`,
    fontHead:"Georgia,'Playfair Display',serif", fontBody:"Georgia,'Times New Roman',serif",
    cardBg:"#FFFDF8", cardBorder:`1px solid ${SLS.sand}`, cardRadius:"8px", cardShadow:"0 2px 8px rgba(0,0,0,0.05)",
    btnRadius:"4px", quoteBg:"#FDF6EC", quoteBorder:`4px solid ${SLS.sand}`, quoteRadius:"4px",
    divider:`1px solid ${SLS.sand}`, iconBg:"#FDF6EC", iconColor:SLS.red, textColor:"#2E2D29", mutedColor:"#7A7568", linkColor:SLS.red,
    cardSimpleBg: "#FDF6EC", cardFeatureBg: SLS.redDk, cardFeatureText: "#F4F1EB", cardActionBg: "#FFFDF8" }},
  F: { name:"Clean Professional", desc:"Crisp lines, blue-gray tones, structured grid, corporate-academic balance", css:{
    pageBg:"#F8FAFC", heroGrad:`linear-gradient(135deg,#1E293B 0%,${SLS.cool} 40%,${SLS.red} 100%)`, heroRadius:"0 0 16px 16px", heroExtra:"",
    fontHead:"system-ui,-apple-system,sans-serif", fontBody:"system-ui,-apple-system,sans-serif",
    cardBg:"#FFFFFF", cardBorder:"1px solid #E2E8F0", cardRadius:"8px", cardShadow:"0 1px 4px rgba(0,0,0,0.05)",
    btnRadius:"6px", quoteBg:"#F1F5F9", quoteBorder:`3px solid ${SLS.red}`, quoteRadius:"6px",
    divider:"1px solid #E2E8F0", iconBg:"#FEF2F2", iconColor:SLS.red, textColor:"#1E293B", mutedColor:"#64748B", linkColor:SLS.red,
    cardSimpleBg: "#F1F5F9", cardFeatureBg: "#1E293B", cardFeatureText: "#FFF", cardActionBg: "#FFFFFF" }},
  G: { name:"Open & Airy", desc:"Extra-light background, floating cards, pastel accents, relaxed spacing", css:{
    pageBg:"#FFFFFF", heroGrad:`linear-gradient(160deg,${SLS.red} 0%,#D4726E 60%,#E8A5A0 100%)`, heroRadius:"0 0 48px 48px", heroExtra:"",
    fontHead:"'Segoe UI',system-ui,sans-serif", fontBody:"'Segoe UI',system-ui,sans-serif",
    cardBg:"#FFFFFF", cardBorder:"1px solid #F3E8E8", cardRadius:"24px", cardShadow:"0 4px 24px rgba(140,21,21,0.06)",
    btnRadius:"999px", quoteBg:"#FFF5F5", quoteBorder:`4px solid #E8A5A0`, quoteRadius:"0 20px 20px 0",
    divider:"1px solid #F3E8E8", iconBg:"#FFF0F0", iconColor:SLS.red, textColor:"#1F2937", mutedColor:"#9CA3AF", linkColor:SLS.red,
    cardSimpleBg: "#FFF5F5", cardFeatureBg: "#D4726E", cardFeatureText: "#FFF", cardActionBg: "#FFFFFF" }},
  H: { name:"Structured Grid", desc:"Strong horizontal rules, numbered sections feel, data-forward and organized", css:{
    pageBg:"#FAFAFA", heroGrad:`linear-gradient(180deg,${SLS.warm} 0%,${SLS.warm} 50%,${SLS.red} 100%)`, heroRadius:"0", heroExtra:`border-bottom:8px solid ${SLS.red}`,
    fontHead:"system-ui,-apple-system,sans-serif", fontBody:"system-ui,sans-serif",
    cardBg:"#FFFFFF", cardBorder:`2px solid #E5E7EB`, cardRadius:"2px", cardShadow:"none",
    btnRadius:"2px", quoteBg:"#FEF2F2", quoteBorder:`5px solid ${SLS.red}`, quoteRadius:"0",
    divider:`2px solid ${SLS.red}`, iconBg:"#FEF2F2", iconColor:SLS.red, textColor:"#111827", mutedColor:"#6B7280", linkColor:SLS.red,
    cardSimpleBg: "#F3F4F6", cardFeatureBg: SLS.red, cardFeatureText: "#FFF", cardActionBg: "#FFFFFF" }}
};

const SAMPLE = `# AI & Legal Research Initiative

## Program Overview

The AI & Legal Research Initiative brings together faculty, students, and technologists to explore how artificial intelligence is transforming the practice and study of law. Launched in Fall 2025, the program offers **hands-on workshops**, research funding, and mentorship for students interested in the intersection of AI and legal scholarship.

The initiative is housed within the Robert Crown Law Library and supported by the Library Technology & Innovations team (https://law.stanford.edu/robert-crown-law-library/).

> Applications for the 2026-2027 cohort are now open. The deadline to apply is June 1, 2026.

## What We Offer

### Workshops & Training

Our workshop series is designed for law students and legal professionals with **no prior technical background**. Topics include:

- Prompt engineering for legal research
- Using AI tools to analyze case law and statutes
- Evaluating AI-generated legal memoranda for accuracy and *hallucination risks*
- Building lightweight research tools with natural language (also known as **vibe coding**)

View the full workshop schedule (https://law.stanford.edu/events/ai-workshops-2026/)

### Research Grants

Each year we award up to **five research grants** of $10,000 to support student-led projects:

1. Automated analysis of judicial sentencing patterns across federal circuits
2. AI-assisted review of international trade agreements
3. Natural language tools for navigating California regulatory codes

Read about last year's grant recipients (https://law.stanford.edu/news/2025-ai-research-grant-winners/)

### Faculty Partnerships

We collaborate with faculty across the law school to integrate AI literacy into existing coursework. Current partners include:

- Professor Elena Matsuda, Constitutional Law — using AI to model outcomes of equal protection challenges
- Professor David Chen, Corporate Governance — exploring automated contract analysis
- Professor Amara Osei, International Human Rights — building datasets for tracking treaty compliance

Learn more about faculty research partnerships (https://law.stanford.edu/programs/ai-legal-research/faculty/)

## Meet the Team

IMAGE: Headshot of Program Director Jordan Reeves standing in the law library atrium (https://drive.google.com/file/d/1xYzAbCdEfGhIjKlMnOpQr/view?usp=sharing)
Caption: Jordan Reeves, Program Director

IMAGE: Group photo of the 2025-2026 student cohort seated around a conference table with laptops open (https://i.postimg.cc/sample-url/cohort-2025-group-photo.jpg)
Caption: The 2025-2026 AI & Legal Research cohort during their fall kickoff session.

## Watch: Program Introduction

VIDEO: Program Director Jordan Reeves explains the goals and structure of the AI & Legal Research Initiative (https://www.youtube.com/watch?v=dQw4w9WgXcQ)

## How to Apply

Applications for the **2026-2027 academic year** are accepted on a rolling basis through June 1, 2026. To apply, submit the following:

1. A one-page statement of interest describing your research question
2. Your current CV or resume
3. One faculty letter of recommendation

Download the application guidelines (https://drive.google.com/file/d/2bCdEfGhIjKlMnOpQrStUv/view?usp=sharing)

FILE: Application FAQ and Checklist (https://drive.google.com/file/d/4eFgHiJkLmNoPqRsTuVwXy/view?usp=sharing)

Submit your completed application through the online portal (https://law.stanford.edu/apply/ai-research-initiative/)

> Questions about the application process? Contact Jordan Reeves at jreeves@law.stanford.edu or visit us in Room 214 of the Robert Crown Law Library.

## Upcoming Events

### Spring 2026 AI Symposium

Join us on **May 8, 2026** for a full-day symposium featuring keynote speakers, panel discussions, and live demonstrations of student research projects. The event is free and open to the entire Stanford community.

IMAGE: Wide shot of last year's symposium showing attendees in the auditorium with a presentation on the main screen (https://drive.google.com/file/d/3cDeFgHiJkLmNoPqRsTuVw/view?usp=sharing)
Caption: The 2025 Spring AI Symposium drew over 200 attendees from across the university.

Register for the 2026 Spring AI Symposium (https://law.stanford.edu/events/ai-symposium-2026/)`;

const STYLE_GUIDE = `WEBSITE CONTENT INTAKE — FORMATTING GUIDE
============================================================

HEADINGS
Use the # symbol before your heading text.
The number of # symbols indicates the heading level.

  # Page Title (Heading 1) — Use only once per page
  ## Section Heading (Heading 2)
  ### Subsection Heading (Heading 3)
  #### Sub-subsection Heading (Heading 4)

BOLD AND ITALIC TEXT
Wrap text in double asterisks for bold, single for italic.

  This word is **bold** and this word is *italic*.

HYPERLINKS
Write the display text followed by the full URL in parentheses.
Do NOT insert clickable hyperlinks — we need the raw URL visible.

  Link Text (https://www.full-url-here.com/page)

Example:
  Visit our admissions page (https://law.stanford.edu/admissions/)

BULLETED LISTS
Use a dash - at the start of each line.

  - First item
  - Second item
  - Third item

NUMBERED LISTS
Use numbers followed by a period.

  1. First step
  2. Second step
  3. Third step

BLOCK QUOTES / CALLOUT TEXT
Use a > symbol before the text.

  > This text will appear as a highlighted callout.

IMAGES
All images must be provided as a full URL.
Host on Google Drive (public link) or Postimages.org.

  IMAGE: [Alt text description] (https://full-url-to-image.com/photo.jpg)
  Caption: [Optional caption text]

VIDEOS
Provide the full URL. Do not embed players.

  VIDEO: [Brief description] (https://full-url-to-video.com)

Accepted: YouTube, Vimeo, Stanford MediaSpace

DOCUMENTS / FILES
Host in Google Drive (public sharing) or provide a direct URL.

  FILE: [Display text] (https://full-url-to-file.com/document.pdf)

============================================================
SUBMISSION CHECKLIST

[ ] All headings use # markup (not Google Docs formatting)
[ ] Bold/italic use asterisk markup
[ ] All links show full URL in parentheses (no embedded hyperlinks)
[ ] All images are hosted externally with full, publicly accessible URL
[ ] All images include alt text descriptions
[ ] All videos provided as full URLs
[ ] Content reviewed for accuracy and typos
[ ] Page title and contact information filled in`;

// --- Parser ---
function parseContent(raw: string) {
  const lines = raw.split("\n");
  const nodes: any[] = [];
  let i = 0;
  let ulBuf: string[] = [], olBuf: string[] = [];
  const flushList = () => { 
    if(ulBuf.length){nodes.push({id:uuidv4(),type:"ul",items:[...ulBuf]});ulBuf=[];} 
    if(olBuf.length){nodes.push({id:uuidv4(),type:"ol",items:[...olBuf]});olBuf=[];} 
  };

  let inCard: string | null = null;
  let currentCard: any = null;
  let lastWasEmpty = false;

  while (i < lines.length) {
    const ln = lines[i].trim();
    
    // Card Block Start
    if (ln.startsWith("::: card-")) {
      flushList();
      inCard = ln.replace("::: card-", "");
      // console.log("Start card", inCard, "lastWasEmpty:", lastWasEmpty);
      currentCard = { id:uuidv4(), type: "card", style: inCard, title: "", icon: "", text: "", link: "", linkText: "", grouped: !lastWasEmpty };
      i++;
      lastWasEmpty = false;
      continue;
    }

    // Card Block End
    if (ln === ":::" && inCard) {
      if (currentCard) {
        // Grouping logic: check if grouped flag is true (no empty line before start)
        const lastNode = nodes[nodes.length - 1];
        // console.log("End card. Grouped:", currentCard.grouped, "LastNode:", lastNode?.type, lastNode?.style);
        if (currentCard.grouped && lastNode && lastNode.type === "card-grid") {
          lastNode.items.push(currentCard);
        } else {
          nodes.push({ id:uuidv4(), type: "card-grid", style: inCard, items: [currentCard] });
        }
      }
      inCard = null;
      currentCard = null;
      i++;
      lastWasEmpty = false;
      continue;
    }

    // Inside Card
    if (inCard && currentCard) {
      if (ln.startsWith("### ")) currentCard.title = ln.slice(4);
      else if (ln.match(/^ICON:\s*/i)) currentCard.icon = ln.replace(/^ICON:\s*/i, "");
      else if (ln.match(/^LINK:\s*/i)) {
        const m = ln.match(/^LINK:\s*(.+?)\s*\((.+?)\)\s*$/i);
        if (m) { currentCard.linkText = m[1]; currentCard.link = m[2]; }
      }
      else if (ln) currentCard.text += (currentCard.text ? "\n" : "") + ln;
      i++;
      continue;
    }

    if (!ln) { flushList(); lastWasEmpty = true; i++; continue; }
    
    lastWasEmpty = false;
    if (ln.startsWith("- ")) { if(olBuf.length)flushList(); ulBuf.push(ln.slice(2)); i++; continue; }
    const olM = ln.match(/^(\d+)\.\s+(.+)/);
    if (olM) { if(ulBuf.length)flushList(); olBuf.push(olM[2]); i++; continue; }
    flushList();

    if (ln.startsWith("#### ")) nodes.push({id:uuidv4(),type:"h4",text:ln.slice(5)});
    else if (ln.startsWith("### ")) nodes.push({id:uuidv4(),type:"h3",text:ln.slice(4)});
    else if (ln.startsWith("## ")) nodes.push({id:uuidv4(),type:"h2",text:ln.slice(3)});
    else if (ln.startsWith("# ")) nodes.push({id:uuidv4(),type:"h1",text:ln.slice(2)});
    else if (ln.startsWith("> ")) nodes.push({id:uuidv4(),type:"quote",text:ln.slice(2)});
    else if (ln.startsWith("IMAGE:")) {
      const m = ln.match(/^IMAGE:\s*(.+?)\s*\((\S+)\)\s*$/);
      let cap = ""; const nxt = (lines[i+1]||"").trim();
      if (nxt.startsWith("Caption:")) { cap = nxt.slice(8).trim(); i++; }
      nodes.push({id:uuidv4(),type:"image",alt:m?.[1]||"Image",src:m?.[2]||"",caption:cap});
    }
    else if (ln.startsWith("VIDEO:")) { const m=ln.match(/^VIDEO:\s*(.+?)\s*\((\S+)\)\s*$/); nodes.push({id:uuidv4(),type:"video",desc:m?.[1]||"Video",src:m?.[2]||""}); }
    else if (ln.startsWith("FILE:")) { const m=ln.match(/^FILE:\s*(.+?)\s*\((\S+)\)\s*$/); nodes.push({id:uuidv4(),type:"file",text:m?.[1]||"File",src:m?.[2]||""}); }
    else if (ln.startsWith("===") || ln.startsWith("[x]") || ln.startsWith("[ ]") || ln.startsWith("Page ") || ln.startsWith("Content Owner") || ln.startsWith("Target ") || ln.startsWith("PAGE CONTENT") || ln.startsWith("Submission")) {}
    else if (ln === "---") nodes.push({id:uuidv4(),type:"divider"});
    else nodes.push({id:uuidv4(),type:"p",text:ln});
    i++;
  }
  flushList();
  return nodes;
}

// --- Serializer ---
function serializeNodes(nodes: any[]) {
  return nodes.map((n, i) => {
    const prev = nodes[i-1];
    const prefix = i > 0 ? "\n\n" : "";
    
    if (n.type === "h1") return `${prefix}# ${n.text}`;
    if (n.type === "h2") return `${prefix}## ${n.text}`;
    if (n.type === "h3") return `${prefix}### ${n.text}`;
    if (n.type === "h4") return `${prefix}#### ${n.text}`;
    if (n.type === "p") return `${prefix}${n.text}`;
    if (n.type === "quote") return `${prefix}> ${n.text}`;
    if (n.type === "ul") return `${prefix}${n.items.map((it:string)=>`- ${it}`).join("\n")}`;
    if (n.type === "ol") return `${prefix}${n.items.map((it:string,j:number)=>`${j+1}. ${it}`).join("\n")}`;
    if (n.type === "divider") return `${prefix}---`;
    if (n.type === "image") return `${prefix}IMAGE: ${n.alt} (${n.src})${n.caption?`\nCaption: ${n.caption}`:""}`;
    if (n.type === "video") return `${prefix}VIDEO: ${n.desc} (${n.src})`;
    if (n.type === "file") return `${prefix}FILE: ${n.text} (${n.src})`;
    if (n.type === "card-grid") {
      return `${prefix}` + n.items.map((c:any) => {
        return `::: card-${c.style || n.style}\n${c.icon?`ICON: ${c.icon}\n`:""}${c.title?`### ${c.title}\n`:""}${c.text ? c.text + "\n" : ""}${c.link?`LINK: ${c.linkText} (${c.link})\n`:""}:::`;
      }).join("\n");
    }
    return "";
  }).join("");
}

// --- Sortable Item Wrapper ---
function SortableItem(props: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, position: "relative" as const, zIndex: isDragging ? 999 : "auto" };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} style={{position:"absolute",left:-24,top:0,bottom:0,width:24,cursor:"grab",display:"flex",alignItems:"center",justifyContent:"center",opacity:0.5}}>
        ⋮
      </div>
      {props.children}
    </div>
  );
}

function inlineFmt(text: string) {
  let o = text.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
  o = o.replace(/\*(.+?)\*/g,"<em>$1</em>");
  
  // Standard Markdown links: [text](url)
  o = o.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    const href = url.startsWith('http') ? url : `https://${url}`;
    return `<a href="${href}" target="_blank" style="color:LINKCOLOR;text-decoration:underline">${linkText}</a>`;
  });

  // Legacy format: Link text (url)
  o = o.replace(/(?:^|\s)([^(\n]+?)\s*\(((?:https?:\/\/)?[\w.-]+\.[a-z]{2,}[^\s)]*)\)/g, (match, linkText, url) => {
    const trimmedText = linkText.trim();
    const href = url.startsWith('http') ? url : `https://${url}`;
    const prefix = match.match(/^\s/)?.[0] || '';
    if (!trimmedText || trimmedText === url) return `${prefix}<a href="${href}" target="_blank" style="color:LINKCOLOR;text-decoration:underline">${url}</a>`;
    return `${prefix}<a href="${href}" target="_blank" style="color:LINKCOLOR;text-decoration:underline">${trimmedText}</a>`;
  });
  return o;
}

function getYTId(url: string) { const m=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/); return m?m[1]:null; }

// --- Preview Component ---
function Preview({nodes, t, isLayoutMode, onUpdateNodes}: {nodes: any[], t: any, isLayoutMode: boolean, onUpdateNodes: (nodes: any[]) => void}) {
  const c = t.css;
  const hs = c.headScale || 1;
  const lc = c.linkColor || SLS.red;

  const heroNode = nodes.find(n => n.type === "h1");
  const heroIdx = heroNode ? nodes.indexOf(heroNode) : -1;
  let gotIntro = false;

  const rndr = (tx: string) => <span dangerouslySetInnerHTML={{__html: inlineFmt(tx).replace(/LINKCOLOR/g, lc)}} />;

  // Helper to split a grid into individual cards
  const splitGrid = (gridNode: any, idx: number) => {
    console.log("Splitting grid at index", idx);
    const cards = gridNode.items.map((item: any) => ({
      id: uuidv4(),
      type: "card-grid",
      style: item.style || gridNode.style,
      items: [item]
    }));
    
    const newNodes = [
      ...nodes.slice(0, idx),
      ...cards,
      ...nodes.slice(idx + 1)
    ];
    
    onUpdateNodes(newNodes);
  };

  // Helper to merge adjacent grids
  const mergeGrid = (idx: number) => {
    console.log("Merging grid at index", idx);
    const curr = nodes[idx];
    const next = nodes[idx+1];
    if (curr && next && curr.type === "card-grid" && next.type === "card-grid") {
      const mergedNode = {
        ...curr,
        items: [...curr.items, ...next.items]
      };
      
      const newNodes = [
        ...nodes.slice(0, idx),
        mergedNode,
        ...nodes.slice(idx + 2)
      ];
      
      onUpdateNodes(newNodes);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (event: any) => {
    const {active, over} = event;
    if (active.id !== over.id) {
      const oldIndex = nodes.findIndex(n => n.id === active.id);
      const newIndex = nodes.findIndex(n => n.id === over.id);
      onUpdateNodes(arrayMove(nodes, oldIndex, newIndex));
    }
  };

  // Inner Sortable Grid Items
  const GridSortable = ({items, style, parentId}: any) => {
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const handleGridDragEnd = (event: any) => {
      const {active, over} = event;
      if (active.id !== over.id) {
        const oldIndex = items.findIndex((n:any) => n.id === active.id);
        const newIndex = items.findIndex((n:any) => n.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update parent node
        const newNodes = nodes.map(n => n.id === parentId ? {...n, items: newItems} : n);
        onUpdateNodes(newNodes);
      }
    };
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGridDragEnd}>
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:24, margin:"32px 0"}}>
            {items.map((card: any, j: number) => (
              <SortableCard key={card.id} card={card} styleType={style} t={t} isLayoutMode={isLayoutMode} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  const SortableCard = ({card, styleType, t, isLayoutMode}: any) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id, disabled: !isLayoutMode });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, position: "relative" as const, zIndex: isDragging ? 999 : "auto", height: "100%" };
    
    const content = (
      <>
        {styleType === "simple" && (
          <div style={{padding:24, background:t.css.cardSimpleBg, borderRadius:t.css.cardRadius, display:"flex", gap:16, alignItems:"flex-start", border:t.css.cardBorder, height:"100%"}}>
            {card.icon && <div style={{width:40, height:40, borderRadius:"50%", background:"#FFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0, boxShadow:"0 2px 4px rgba(0,0,0,0.05)"}}>{card.icon}</div>}
            <div>
              {card.title && <div style={{fontWeight:700, fontSize:16, marginBottom:4, fontFamily:t.css.fontHead}}>{card.title}</div>}
              {card.text && <div style={{fontSize:14, lineHeight:1.5, color:t.css.mutedColor, marginBottom:8}} dangerouslySetInnerHTML={{__html:inlineFmt(card.text)}} />}
              {card.link && <a href={card.link} target="_blank" style={{fontSize:14, fontWeight:600, color:t.css.linkColor, textDecoration:"none"}}>{card.linkText || "Learn more"} &rarr;</a>}
            </div>
          </div>
        )}
        {styleType === "feature" && (
          <div style={{padding:32, background:t.css.cardFeatureBg, borderRadius:t.css.cardRadius, color:t.css.cardFeatureText, display:"flex", gap:20, alignItems:"center", height:"100%"}}>
            {card.icon && <div style={{width:56, height:56, borderRadius:12, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0}}>{card.icon}</div>}
            <div>
              {card.title && <div style={{fontWeight:700, fontSize:20, marginBottom:8, fontFamily:t.css.fontHead}}>{card.title}</div>}
              {card.text && <div style={{fontSize:15, lineHeight:1.5, opacity:0.9}} dangerouslySetInnerHTML={{__html:inlineFmt(card.text)}} />}
            </div>
          </div>
        )}
        {styleType === "action" && (
          <div style={{padding:24, background:t.css.cardActionBg, borderRadius:t.css.cardRadius, border:t.css.cardBorder, display:"flex", flexDirection:"column", height:"100%"}}>
            {card.icon && <div style={{width:48, height:48, borderRadius:12, background:t.css.iconBg, color:t.css.iconColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:16, alignSelf:"flex-start"}}>{card.icon}</div>}
            {card.title && <div style={{fontWeight:700, fontSize:18, marginBottom:8, fontFamily:t.css.fontHead}}>{card.title}</div>}
            {card.text && <div style={{fontSize:15, lineHeight:1.6, color:t.css.mutedColor, marginBottom:24, flex:1}} dangerouslySetInnerHTML={{__html:inlineFmt(card.text)}} />}
            {card.link && <a href={card.link} target="_blank" style={{fontSize:14, fontWeight:700, color:t.css.linkColor, textDecoration:"none", display:"flex", alignItems:"center", gap:6}}>{card.linkText || "Explore"} <span>&rarr;</span></a>}
          </div>
        )}
      </>
    );

    if (!isLayoutMode) return <div style={{height:"100%"}}>{content}</div>;

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div {...listeners} style={{position:"absolute",right:8,top:8,width:24,height:24,background:"rgba(0,0,0,0.1)",borderRadius:4,cursor:"grab",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>⋮</div>
        {content}
      </div>
    );
  };

  const content = (
    <div style={{maxWidth:860, margin:"0 auto", padding:"40px 24px 64px"}}>
      {nodes.length === 0 && (
        <div style={{textAlign:"center", padding:40, color:c.mutedColor, border:`2px dashed ${c.divider.split(" ")[2]}`, borderRadius:12}}>
          <div style={{fontSize:48, marginBottom:16}}>✨</div>
          <h3 style={{fontSize:18, fontWeight:600, color:c.textColor, marginBottom:8}}>Start Creating</h3>
          <p style={{fontSize:14}}>Type in the editor or use the toolbar to add content.</p>
          <div style={{marginTop:24, fontSize:12, opacity:0.7}}>
            Theme: <b>{t.name}</b> • {t.desc}
          </div>
        </div>
      )}
      {nodes.map((n, i) => {
        // Skip hero
        if (heroIdx !== -1 && i === heroIdx) return null;

        // Skip intro paragraph (it's in the hero)
        if (heroIdx !== -1 && !gotIntro && n.type === "p" && i > heroIdx) {
          gotIntro = true;
          return null;
        }

        const comp = (() => {
          if(n.type==="h2") return <h2 style={{fontFamily:c.fontHead,fontSize:28*hs,fontWeight:600,color:c.textColor,margin:"48px 0 16px",paddingBottom:12,borderBottom:c.divider}}>{n.text}</h2>;
          if(n.type==="h3") return <h3 style={{fontFamily:c.fontHead,fontSize:22*hs,fontWeight:600,color:c.textColor,margin:"32px 0 12px"}}>{n.text}</h3>;
          if(n.type==="h4") return <h4 style={{fontFamily:c.fontHead,fontSize:18*hs,fontWeight:600,color:c.textColor,margin:"24px 0 8px"}}>{n.text}</h4>;
          if(n.type==="p") return <p style={{fontSize:16,lineHeight:1.7,margin:"0 0 12px"}}>{rndr(n.text)}</p>;
          if(n.type==="quote") return <div style={{padding:"16px 20px",margin:"16px 0",background:c.quoteBg,borderLeft:c.quoteBorder!=="none"?c.quoteBorder:undefined,borderRadius:c.quoteRadius,color:c.quoteColor||c.textColor,fontFamily:c.fontHead,fontSize:c.quoteColor?18:16,fontWeight:c.quoteColor?600:400,lineHeight:1.6}}>{rndr(n.text)}</div>;
          if(n.type==="ul") return <ul style={{marginBottom:16,padding:0,listStyle:"none"}}>{n.items.map((it: string,j: number)=><li key={j} style={{display:"flex",gap:10,marginBottom:6,fontSize:15,lineHeight:1.6}}><span style={{color:SLS.red,fontWeight:700,flexShrink:0}}>•</span><span>{rndr(it)}</span></li>)}</ul>;
          if(n.type==="ol") return <ol style={{marginBottom:16,padding:0,listStyle:"none"}}>{n.items.map((it: string,j: number)=><li key={j} style={{display:"flex",gap:10,marginBottom:6,fontSize:15,lineHeight:1.6}}><span style={{color:SLS.red,fontWeight:700,flexShrink:0}}>{j+1}.</span><span>{rndr(it)}</span></li>)}</ol>;
          if(n.type==="divider") return <hr style={{border:0, borderTop:c.divider, margin:"32px 0"}} />;
          if(n.type==="image") return (
            <figure style={{margin:"24px 0",borderRadius:c.cardRadius,overflow:"hidden",border:c.cardBorder,background:"#F9FAFB"}}>
              <img src={n.src || undefined} alt={n.alt} style={{width:"100%",display:"block",minHeight:200,objectFit:"cover",background:"#E5E7EB"}} onError={(e: any)=>{e.target.style.display="none";e.target.nextSibling.style.display="flex"}} />
              <div style={{display:"none",height:200,alignItems:"center",justifyContent:"center",flexDirection:"column",color:c.mutedColor,background:"#F3F4F6"}}>
                <span style={{fontSize:36,marginBottom:8}}>🖼️</span>
                <span style={{fontSize:13,fontWeight:600}}>{n.alt}</span>
                <a href={n.src || undefined} target="_blank" rel="noreferrer" style={{fontSize:11,marginTop:4,color:SLS.red,wordBreak:"break-all",maxWidth:"80%",textAlign:"center"}}>{n.src}</a>
              </div>
              {n.caption&&<figcaption style={{padding:"12px 16px",fontSize:13,color:c.mutedColor,borderTop:"1px solid #E5E7EB"}}>{n.caption}</figcaption>}
            </figure>
          );
          if(n.type==="video"){
            const ytId=getYTId(n.src);
            const isDrive = n.src && n.src.includes("drive.google.com/file/d/");
            const driveUrl = isDrive ? n.src.replace(/\/view.*$/, "/preview") : null;
            return <div style={{margin:"24px 0"}}>{ytId?(
              <div style={{position:"relative",paddingBottom:"56.25%",height:0,borderRadius:c.cardRadius,overflow:"hidden",border:c.cardBorder}}>
                <iframe src={`https://www.youtube.com/embed/${ytId}`} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen title={n.desc}/>
              </div>
            ): driveUrl ? (
              <div style={{position:"relative",paddingBottom:"56.25%",height:0,borderRadius:c.cardRadius,overflow:"hidden",border:c.cardBorder}}>
                <iframe src={driveUrl} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen title={n.desc}/>
              </div>
            ) : (
              <a href={n.src || undefined} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:16,padding:24,border:c.cardBorder,borderRadius:c.cardRadius,background:c.cardBg,textDecoration:"none",color:c.textColor}}>
                <span style={{fontSize:32}}>🎬</span>
                <div><div style={{fontWeight:600,marginBottom:4}}>{n.desc}</div><span style={{fontSize:13,color:SLS.red}}>{n.src}</span></div>
              </a>
            )}</div>;
          }
          if(n.type==="file") return (
            <a href={n.src || undefined} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:14,margin:"16px 0",padding:"16px 20px",border:c.cardBorder,borderRadius:c.cardRadius,background:c.cardBg,textDecoration:"none",color:c.textColor}}>
              <span style={{fontSize:24}}>📄</span>
              <div><div style={{fontWeight:600,fontSize:15}}>{n.text}</div><span style={{fontSize:13,color:SLS.red,wordBreak:"break-all"}}>{n.src}</span></div>
            </a>
          );
          if(n.type==="card-grid") {
            return (
              <div style={{position:"relative"}}>
                {isLayoutMode && (
                  <div style={{position:"absolute", top:-20, right:0, display:"flex", gap:4, zIndex:20}}>
                    {n.items.length > 1 && <button onClick={()=>splitGrid(n, i)} style={{fontSize:10, padding:"2px 6px", background:"#FFF", border:"1px solid #CCC", borderRadius:4, cursor:"pointer"}}>Split Grid</button>}
                    {nodes[i+1]?.type === "card-grid" && <button onClick={()=>mergeGrid(i)} style={{fontSize:10, padding:"2px 6px", background:"#FFF", border:"1px solid #CCC", borderRadius:4, cursor:"pointer"}}>Merge Next</button>}
                  </div>
                )}
                <GridSortable items={n.items} style={n.style} parentId={n.id} />
              </div>
            );
          }
          return null;
        })();

        if (isLayoutMode) {
          return <SortableItem key={n.id} id={n.id}>{comp}</SortableItem>;
        }
        return <div key={n.id}>{comp}</div>;
      })}
    </div>
  );

  if (isLayoutMode) {
    return (
      <div style={{background:c.pageBg,fontFamily:c.fontBody,color:c.textColor,minHeight:"100%"}}>
        <div style={{background:c.heroGrad,padding:"56px 40px",borderRadius:c.heroRadius,margin:c.heroMargin||0,...(c.heroExtra?.includes("border")?{borderBottom:c.heroExtra.replace("border-bottom:","")}:{})}}>
          <div style={{maxWidth:700}}>
            {heroNode&&<h1 style={{fontFamily:c.fontHead,fontSize:40*hs,fontWeight:700,color:"#FFF",marginBottom:16,lineHeight:1.15}}>{heroNode.text}</h1>}
            {nodes.map((n,i)=>{
              if(heroIdx!==-1 && !gotIntro && n.type==="p" && i>heroIdx) {
                return <p key={i} style={{color:"rgba(255,255,255,0.88)",fontSize:17,lineHeight:1.6,fontWeight:300}}>{rndr(n.text)}</p>
              }
              return null;
            })}
          </div>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={nodes} strategy={verticalListSortingStrategy}>
            {content}
          </SortableContext>
        </DndContext>
      </div>
    );
  }

  return (
    <div style={{background:c.pageBg,fontFamily:c.fontBody,color:c.textColor,minHeight:"100%"}}>
      <div style={{background:c.heroGrad,padding:"56px 40px",borderRadius:c.heroRadius,margin:c.heroMargin||0,...(c.heroExtra?.includes("border")?{borderBottom:c.heroExtra.replace("border-bottom:","")}:{})}}>
        <div style={{maxWidth:700}}>
          {heroNode&&<h1 style={{fontFamily:c.fontHead,fontSize:40*hs,fontWeight:700,color:"#FFF",marginBottom:16,lineHeight:1.15}}>{heroNode.text}</h1>}
          {nodes.map((n,i)=>{
            if(heroIdx!==-1 && !gotIntro && n.type==="p" && i>heroIdx) {
              return <p key={i} style={{color:"rgba(255,255,255,0.88)",fontSize:17,lineHeight:1.6,fontWeight:300}}>{rndr(n.text)}</p>
            }
            return null;
          })}
        </div>
      </div>
      {content}
    </div>
  );
}

// --- HTML Generator ---
function genHTML(nodes: any[],t: any) {
  const c=t.css, hs=c.headScale||1, lc=c.linkColor||SLS.red;
  const heroNode=nodes.find(n=>n.type==="h1");
  const heroIdx=heroNode?nodes.indexOf(heroNode):-1;
  let introHTML=""; const bp: string[]=[];
  let past=false,gotIntro=false;
  const fmt = (tx: string) => inlineFmt(tx).replace(/LINKCOLOR/g,lc);

  for(let i=0;i<nodes.length;i++){
    const n=nodes[i];
    if(i===heroIdx){past=true;continue;}
    if(past&&!gotIntro&&n.type==="p"){introHTML=`<p style="color:rgba(255,255,255,0.88);font-size:17px;line-height:1.6;font-weight:300;margin:0">${fmt(n.text)}</p>`;gotIntro=true;continue;}
    if(!past&&heroIdx!==-1) continue;

    if(n.type==="h2") bp.push(`<h2 style="font-family:${c.fontHead};font-size:${28*hs}px;font-weight:600;color:${c.textColor};margin:48px 0 16px;padding-bottom:12px;border-bottom:${c.divider}">${n.text}</h2>`);
    else if(n.type==="h3") bp.push(`<h3 style="font-family:${c.fontHead};font-size:${22*hs}px;font-weight:600;color:${c.textColor};margin:32px 0 12px">${n.text}</h3>`);
    else if(n.type==="h4") bp.push(`<h4 style="font-family:${c.fontHead};font-size:${18*hs}px;font-weight:600;color:${c.textColor};margin:24px 0 8px">${n.text}</h4>`);
    else if(n.type==="p") bp.push(`<p style="font-size:16px;line-height:1.7;margin:0 0 12px">${fmt(n.text)}</p>`);
    else if(n.type==="divider") bp.push(`<hr style="border:0;border-top:${c.divider};margin:32px 0">`);
    else if(n.type==="quote") bp.push(`<blockquote style="padding:16px 20px;margin:16px 0;background:${c.quoteBg};${c.quoteBorder!=="none"?`border-left:${c.quoteBorder};`:""}border-radius:${c.quoteRadius};color:${c.quoteColor||c.textColor};font-family:${c.fontHead};line-height:1.6">${fmt(n.text)}</blockquote>`);
    else if(n.type==="ul") bp.push(`<ul style="list-style:none;padding:0;margin:0 0 16px">${n.items.map((it: string)=>`<li style="display:flex;gap:10px;margin-bottom:6px;font-size:15px;line-height:1.6"><span style="color:${SLS.red};font-weight:700">•</span><span>${fmt(it)}</span></li>`).join("")}</ul>`);
    else if(n.type==="ol") bp.push(`<ol style="list-style:none;padding:0;margin:0 0 16px">${n.items.map((it: string,j: number)=>`<li style="display:flex;gap:10px;margin-bottom:6px;font-size:15px;line-height:1.6"><span style="color:${SLS.red};font-weight:700">${j+1}.</span><span>${fmt(it)}</span></li>`).join("")}</ol>`);
    else if(n.type==="image") bp.push(`<figure style="margin:24px 0;border-radius:${c.cardRadius};overflow:hidden;border:${c.cardBorder};background:#F9FAFB"><img src="${n.src}" alt="${n.alt}" style="width:100%;display:block;min-height:200px;object-fit:cover">${n.caption?`<figcaption style="padding:12px 16px;font-size:13px;color:${c.mutedColor};border-top:1px solid #E5E7EB">${n.caption}</figcaption>`:""}</figure>`);
    else if(n.type==="video"){
      const ytId=getYTId(n.src);
      const isDrive = n.src && n.src.includes("drive.google.com/file/d/");
      const driveUrl = isDrive ? n.src.replace(/\/view.*$/, "/preview") : null;
      if(ytId) bp.push(`<div style="margin:24px 0;position:relative;padding-bottom:56.25%;height:0;border-radius:${c.cardRadius};overflow:hidden;border:${c.cardBorder}"><iframe src="https://www.youtube.com/embed/${ytId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen></iframe></div>`);
      else if(driveUrl) bp.push(`<div style="margin:24px 0;position:relative;padding-bottom:56.25%;height:0;border-radius:${c.cardRadius};overflow:hidden;border:${c.cardBorder}"><iframe src="${driveUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allowfullscreen></iframe></div>`);
      else bp.push(`<div style="margin:24px 0;padding:24px;border:${c.cardBorder};border-radius:${c.cardRadius};background:${c.cardBg}"><strong>${n.desc}</strong><br><a href="${n.src}" style="color:${SLS.red}">${n.src}</a></div>`);
    }
    else if(n.type==="file") bp.push(`<a href="${n.src}" target="_blank" style="display:flex;align-items:center;gap:14px;margin:16px 0;padding:16px 20px;border:${c.cardBorder};border-radius:${c.cardRadius};background:${c.cardBg};text-decoration:none;color:${c.textColor}"><span style="font-size:24px">📄</span><div><div style="font-weight:600;font-size:15px">${n.text}</div><span style="font-size:13px;color:${SLS.red};word-break:break-all">${n.src}</span></div></a>`);
    else if(n.type==="card-grid") {
      const cardsHTML = n.items.map((card: any) => {
        if (n.style === "simple") {
          return `<div style="padding:24px;background:${c.cardSimpleBg};border-radius:${c.cardRadius};display:flex;gap:16px;align-items:flex-start;border:${c.cardBorder}">${card.icon?`<div style="width:40px;height:40px;border-radius:50%;background:#FFF;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:0 2px 4px rgba(0,0,0,0.05)">${card.icon}</div>`:""}<div>${card.title?`<div style="font-weight:700;font-size:16px;margin-bottom:4px;font-family:${c.fontHead}">${card.title}</div>`:""}${card.text?`<div style="font-size:14px;line-height:1.5;color:${c.mutedColor};margin-bottom:8px">${fmt(card.text)}</div>`:""}${card.link?`<a href="${card.link}" target="_blank" style="font-size:14px;font-weight:600;color:${c.linkColor};text-decoration:none">${card.linkText||"Learn more"} &rarr;</a>`:""}</div></div>`;
        }
        if (n.style === "feature") {
          return `<div style="padding:32px;background:${c.cardFeatureBg};border-radius:${c.cardRadius};color:${c.cardFeatureText};display:flex;gap:20px;align-items:center">${card.icon?`<div style="width:56px;height:56px;border-radius:12px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">${card.icon}</div>`:""}<div>${card.title?`<div style="font-weight:700;font-size:20px;margin-bottom:8px;font-family:${c.fontHead}">${card.title}</div>`:""}${card.text?`<div style="font-size:15px;line-height:1.5;opacity:0.9">${fmt(card.text)}</div>`:""}</div></div>`;
        }
        if (n.style === "action") {
          return `<div style="padding:24px;background:${c.cardActionBg};border-radius:${c.cardRadius};border:${c.cardBorder};display:flex;flex-direction:column;height:100%">${card.icon?`<div style="width:48px;height:48px;border-radius:12px;background:${c.iconBg};color:${c.iconColor};display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px;align-self:flex-start">${card.icon}</div>`:""}${card.title?`<div style="font-weight:700;font-size:18px;margin-bottom:8px;font-family:${c.fontHead}">${card.title}</div>`:""}${card.text?`<div style="font-size:15px;line-height:1.6;color:${c.mutedColor};margin-bottom:24px;flex:1">${fmt(card.text)}</div>`:""}${card.link?`<a href="${card.link}" target="_blank" style="font-size:14px;font-weight:700;color:${c.linkColor};text-decoration:none;display:flex;align-items:center;gap:6px">${card.linkText||"Explore"} <span>&rarr;</span></a>`:""}</div>`;
        }
        return "";
      }).join("");
      bp.push(`<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:24px;margin:32px 0">${cardsHTML}</div>`);
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${heroNode?.text||"Page"}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:${c.pageBg};font-family:${c.fontBody};color:${c.textColor};-webkit-font-smoothing:antialiased}a{color:${SLS.red}}strong{font-weight:700}em{font-style:italic}img{max-width:100%}</style>
</head>
<body>
<div style="background:${c.heroGrad};padding:56px 40px;border-radius:${c.heroRadius};${c.heroMargin?`margin:${c.heroMargin};`:""}${c.heroExtra||""}">
<div style="max-width:700px">
${heroNode?`<h1 style="font-family:${c.fontHead};font-size:${40*hs}px;font-weight:700;color:#FFF;margin-bottom:16px;line-height:1.15">${heroNode.text}</h1>`:""}
${introHTML}
</div>
</div>
<div style="max-width:860px;margin:0 auto;padding:40px 24px 64px">
${bp.join("\n")}
</div>
</body>
</html>`;
}

// --- Tabs: Style Guide & Sample ---
function RefTab({content,title}: {content: string, title: string}) {
  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"40px 24px 80px"}}>
      <h2 style={{fontFamily:"Georgia,serif",fontSize:28,fontWeight:600,color:SLS.red,marginBottom:8}}>{title}</h2>
      <p style={{fontSize:14,color:"#6B7280",marginBottom:24}}>Copy this into a Google Doc for contributors to reference.</p>
      <pre style={{background:"#1E293B",color:"#E2E8F0",padding:24,borderRadius:12,fontSize:13,lineHeight:1.7,overflowX:"auto",whiteSpace:"pre-wrap",fontFamily:"'SF Mono','Fira Code',Consolas,monospace"}}>{content}</pre>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [mainTab, setMainTab] = useState("builder");
  const [active, setActive] = useState<keyof typeof themes>("A");
  const [content, setContent] = useState("");
  const [view, setView] = useState("split");
  const [copied, setCopied] = useState(false);
  const [isLayoutMode, setIsLayoutMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // History State
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const ignoreHistoryChange = useRef(false);
  const historyTimeout = useRef<any>(null);

  // History Management
  useEffect(() => {
    if (ignoreHistoryChange.current) {
      ignoreHistoryChange.current = false;
      return;
    }

    if (historyTimeout.current) clearTimeout(historyTimeout.current);

    historyTimeout.current = setTimeout(() => {
      setHistory(prev => {
        const currentCommit = prev[historyIdx];
        if (content === currentCommit) return prev;
        
        const newHist = prev.slice(0, historyIdx + 1);
        newHist.push(content);
        return newHist;
      });
      setHistoryIdx(prev => {
        // Only increment if we actually added something (checked inside setHistory, but simpler here to just assume sync)
        // Actually, we need to be careful. Let's just trust the slice logic.
        // If content didn't change, we shouldn't be here? 
        // Wait, content changed to trigger useEffect.
        return historyIdx + 1; 
      });
    }, 800);

    return () => clearTimeout(historyTimeout.current);
  }, [content]);

  const handleUndo = () => {
    // If we have uncommitted changes, revert to current commit
    if (content !== history[historyIdx]) {
      ignoreHistoryChange.current = true;
      setContent(history[historyIdx]);
      return;
    }

    // Otherwise go back one step
    if (historyIdx > 0) {
      ignoreHistoryChange.current = true;
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      setContent(history[newIdx]);
    }
  };

  const nodes = useMemo(()=>parseContent(content),[content]);
  const t = themes[active];
  const html = useMemo(()=>genHTML(nodes,t),[nodes,t]);

  const handleUpdateNodes = (newNodes: any[]) => {
    setContent(serializeNodes(newNodes));
  };

  const handleCopy = useCallback(()=>{navigator.clipboard.writeText(html).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500)});},[html]);
  const handleDL = useCallback(()=>{const b=new Blob([html],{type:"text/html"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`page-style-${active}.html`;a.click();URL.revokeObjectURL(u);},[html,active]);

  const insertText = (before: string, after = "", defaultText = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = content;
    const selected = text.slice(start, end) || defaultText;
    const newText = text.slice(0, start) + before + selected + after + text.slice(end);
    setContent(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const btnStyle = {padding:"4px 8px", fontSize:11, fontWeight:600, color:"#4B5563", background:"#FFF", border:"1px solid #D1D5DB", borderRadius:4, cursor:"pointer"};

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#F3F4F6",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:SLS.warm,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:32,height:32,borderRadius:8,background:SLS.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🎨</div>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:"#FFF",letterSpacing:0.3}}>AI Learning Hub</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",fontWeight:500}}>Canvas Mode</div>
          </div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {[["builder","Builder"],["guide","Style Guide"],["sample","Sample Content"]].map(([k,l])=>(
            <button key={k} onClick={()=>setMainTab(k)} style={{
              padding:"7px 16px",borderRadius:6,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,
              background:mainTab===k?"rgba(255,255,255,0.15)":"transparent",
              color:mainTab===k?"#FFF":"rgba(255,255,255,0.55)",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {mainTab==="guide" && <RefTab content={STYLE_GUIDE} title="Formatting Style Guide" />}
      {mainTab==="sample" && <RefTab content={SAMPLE} title="Sample Content Submission" />}

      {mainTab==="builder" && <>
        {/* Style + View bar */}
        <div style={{background:"#FFF",borderBottom:"1px solid #E5E7EB",padding:"0 12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"10px 0",flexWrap:"wrap"}}>
            <span style={{fontSize:11,fontWeight:700,color:"#9CA3AF",marginRight:2}}>STYLE:</span>
            {Object.entries(themes).map(([k,v])=>(
              <button key={k} onClick={()=>setActive(k as keyof typeof themes)} style={{
                padding:"5px 10px",borderRadius:6,border:"2px solid",fontSize:11,fontWeight:600,cursor:"pointer",
                borderColor:active===k?SLS.red:"#E5E7EB", background:active===k?"#FEF2F2":"#FFF", color:active===k?SLS.red:"#374151"
              }}>{k}</button>
            ))}
            <div style={{flex:1,minWidth:8}} />
            <span style={{fontSize:11,fontWeight:700,color:"#9CA3AF",marginRight:2}}>VIEW:</span>
            {[["split","Split"],["edit","Edit"],["preview","Preview"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} style={{
                padding:"5px 10px",borderRadius:6,border:"1px solid",fontSize:11,fontWeight:500,cursor:"pointer",
                borderColor:view===v?"#374151":"#E5E7EB", background:view===v?"#374151":"#FFF", color:view===v?"#FFF":"#374151"
              }}>{l}</button>
            ))}
            <div style={{width:1, height:16, background:"#E5E7EB", margin:"0 4px"}}/>
            <button onClick={()=>setIsLayoutMode(!isLayoutMode)} style={{
              padding:"5px 10px",borderRadius:6,border:"1px solid",cursor:"pointer",fontSize:11,fontWeight:600,
              borderColor:isLayoutMode?SLS.red:"#E5E7EB", background:isLayoutMode?"#FEF2F2":"#FFF", color:isLayoutMode?SLS.red:"#374151"
            }}>
              {isLayoutMode ? "Done Arranging" : "Arrange Layout"}
            </button>
            <div style={{width:1,height:20,background:"#E5E7EB",margin:"0 4px"}} />
            <button onClick={handleCopy} style={{padding:"5px 12px",borderRadius:6,border:`2px solid ${SLS.red}`,background:copied?SLS.red:"#FFF",color:copied?"#FFF":SLS.red,fontWeight:600,fontSize:11,cursor:"pointer"}}>{copied?"✓ Copied!":"Copy HTML"}</button>
            <button onClick={handleDL} style={{padding:"5px 12px",borderRadius:6,border:"none",background:SLS.red,color:"#FFF",fontWeight:600,fontSize:11,cursor:"pointer"}}>↓ Download</button>
          </div>
        </div>

        {/* Style name bar */}
        <div style={{background:"#FEFCE8",borderBottom:"1px solid #FDE68A",padding:"8px 16px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:28,height:28,borderRadius:6,background:SLS.red,display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontWeight:800,fontSize:14}}>{active}</div>
          <div><span style={{fontWeight:700,fontSize:14,color:"#1F2937"}}>{t.name}</span><span style={{fontSize:13,color:"#6B7280",marginLeft:8}}>— {t.desc}</span></div>
        </div>

        {/* Editor + Preview */}
        <div style={{flex:1,display:"flex",minHeight:0,overflow:"hidden"}}>
          {(view==="split"||view==="edit")&&(
            <div style={{flex:view==="edit"?1:"0 0 40%",display:"flex",flexDirection:"column",borderRight:view==="split"?"1px solid #D1D5DB":"none"}}>
              <div style={{padding:"8px 16px",background:"#F9FAFB",borderBottom:"1px solid #E5E7EB",fontSize:11,fontWeight:700,color:"#6B7280",display:"flex",justifyContent:"space-between"}}>
                <span>CONTENT EDITOR</span>
                <div style={{display:"flex", gap: 12}}>
                  <button onClick={handleUndo} style={{fontSize:10,color:"#6B7280",background:"none",border:"none",cursor:"pointer",fontWeight:600,outline:"none",opacity:historyIdx>0||content!==history[historyIdx]?1:0.3}}>⎌ Undo</button>
                  <button onClick={()=>setContent("")} style={{fontSize:10,color:"#6B7280",background:"none",border:"none",cursor:"pointer",fontWeight:600,outline:"none"}}>Clear</button>
                  <button onClick={()=>setContent(SAMPLE)} style={{fontSize:10,color:SLS.red,background:"none",border:"none",cursor:"pointer",fontWeight:600,outline:"none"}}>Reset Sample</button>
                </div>
              </div>
              <div style={{padding:"8px 12px",background:"#F3F4F6",borderBottom:"1px solid #E5E7EB",display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={()=>insertText("# ", "", "")} style={btnStyle}>H1</button>
                <button onClick={()=>insertText("## ", "", "")} style={btnStyle}>H2</button>
                <div style={{width:1, height:16, background:"#D1D5DB", margin:"0 2px"}}/>
                <button onClick={()=>insertText("**", "**", "bold")} style={btnStyle}><b>B</b></button>
                <button onClick={()=>insertText("*", "*", "italic")} style={btnStyle}><i>I</i></button>
                <button onClick={()=>insertText("[", "](https://)", "Link text")} style={btnStyle}>🔗 Link</button>
                <div style={{width:1, height:16, background:"#D1D5DB", margin:"0 2px"}}/>
                <button onClick={()=>insertText("> ", "", "Quote")} style={btnStyle}>❞ Quote</button>
                <button onClick={()=>insertText("- ", "", "List item")} style={btnStyle}>• List</button>
                <div style={{width:1, height:16, background:"#D1D5DB", margin:"0 2px"}}/>
                <button onClick={()=>insertText("\nIMAGE: ", " (https://)\nCaption: Optional caption\n", "Image description")} style={btnStyle}>🖼️ Image</button>
                <button onClick={()=>insertText("\nVIDEO: ", " (https://)\n", "Video description")} style={btnStyle}>🎬 Video</button>
                <button onClick={()=>insertText("\nFILE: ", " (https://)\n", "Document name")} style={btnStyle}>📄 File</button>
                <div style={{width:1, height:16, background:"#D1D5DB", margin:"0 2px"}}/>
                <button onClick={()=>insertText("\n---\n", "", "")} style={btnStyle}>➖ Divider</button>
                <div style={{width:1, height:16, background:"#D1D5DB", margin:"0 2px"}}/>
                <button onClick={()=>insertText("\n::: card-simple\n### Title\nBody text\nLINK: Link Text (https://)\n:::\n", "", "")} style={btnStyle}>📇 Simple</button>
                <button onClick={()=>insertText("\n::: card-feature\n### Title\nBody text\n:::\n", "", "")} style={btnStyle}>⭐ Feature</button>
                <button onClick={()=>insertText("\n::: card-action\n### Title\nBody text\nLINK: Explore (https://)\n:::\n", "", "")} style={btnStyle}>⚡ Action</button>
              </div>
              <textarea ref={textareaRef} value={content} onChange={e=>setContent(e.target.value)} spellCheck={false} style={{
                flex:1,padding:16,border:"none",outline:"none",resize:"none",
                fontFamily:"'SF Mono','Fira Code',Consolas,monospace",fontSize:12.5,
                lineHeight:1.7,background:"#FAFAFA",color:"#1F2937",
                minHeight:view==="edit"?"calc(100vh - 160px)":"auto",
              }}/>
            </div>
          )}
          {(view==="split"||view==="preview")&&(
            <div style={{flex:1,overflow:"auto",background:t.css.pageBg}}>
              <Preview nodes={nodes} t={t} isLayoutMode={isLayoutMode} onUpdateNodes={handleUpdateNodes} />
            </div>
          )}
        </div>
      </>}
    </div>
  );
}
