/* ============ JavaScript ============ */
(function(){
var KEY="booknest-data-v3",SKEY="booknest-user",FINE=5,DAYS=14;
var USERS={admin:{pw:"admin123",name:"Admin"},librarian:{pw:"library1",name:"Librarian"}};
var TABS=[["dashboard","Dashboard"],["books","Books"],["members","Members"],["circulation","Issue & return"]];
var STABS=[["books","Browse books"],["myloans","My loans"]];
var CATS=["Programming","Algorithms","Systems","Networks","Databases","AI & ML","Software Eng.","Electronics & Math"];
var tab="dashboard",search="",cat="All",user=null,role="admin";

/* 50 seed books: title | author | category index */
var RAW="Clean Code|Robert C. Martin|0;The Pragmatic Programmer|Andrew Hunt, David Thomas|0;Code Complete|Steve McConnell|0;The C Programming Language|Kernighan, Ritchie|0;Effective Java|Joshua Bloch|0;Python Crash Course|Eric Matthes|0;Eloquent JavaScript|Marijn Haverbeke|0;You Don’t Know JS Yet|Kyle Simpson|0;Head First Java|Kathy Sierra, Bert Bates|0;Let Us C|Yashavant Kanetkar|0;Fluent Python|Luciano Ramalho|0;Learning SQL|Alan Beaulieu|0;"
+"Introduction to Algorithms|Cormen, Leiserson, Rivest, Stein|1;Algorithms|Robert Sedgewick|1;The Algorithm Design Manual|Steven Skiena|1;Grokking Algorithms|Aditya Bhargava|1;Cracking the Coding Interview|Gayle Laakmann McDowell|1;Algorithm Design|Kleinberg, Tardos|1;Data Structures and Algorithms in Java|Goodrich, Tamassia|1;"
+"Operating System Concepts|Silberschatz, Galvin|2;Modern Operating Systems|Andrew Tanenbaum|2;Computer Organization and Design|Patterson, Hennessy|2;Computer Systems: A Programmer’s Perspective|Bryant, O’Hallaron|2;Compilers: Principles, Techniques, and Tools|Aho, Lam, Sethi, Ullman|2;Introduction to the Theory of Computation|Michael Sipser|2;"
+"Computer Networks|Andrew Tanenbaum|3;Computer Networking: A Top-Down Approach|Kurose, Ross|3;TCP/IP Illustrated|W. Richard Stevens|3;Cryptography and Network Security|William Stallings|3;"
+"Database System Concepts|Silberschatz, Korth|4;Fundamentals of Database Systems|Elmasri, Navathe|4;Designing Data-Intensive Applications|Martin Kleppmann|4;"
+"Artificial Intelligence: A Modern Approach|Russell, Norvig|5;Deep Learning|Goodfellow, Bengio, Courville|5;Pattern Recognition and Machine Learning|Christopher Bishop|5;Hands-On Machine Learning|Aurélien Géron|5;The Hundred-Page Machine Learning Book|Andriy Burkov|5;Machine Learning|Tom Mitchell|5;"
+"Design Patterns|Gamma, Helm, Johnson, Vlissides|6;Refactoring|Martin Fowler|6;The Mythical Man-Month|Frederick Brooks|6;Software Engineering|Ian Sommerville|6;Software Engineering: A Practitioner’s Approach|Roger Pressman|6;Clean Architecture|Robert C. Martin|6;"
+"The Art of Electronics|Horowitz, Hill|7;Microelectronic Circuits|Sedra, Smith|7;Digital Design|M. Morris Mano|7;Signals and Systems|Oppenheim, Willsky|7;Advanced Engineering Mathematics|Erwin Kreyszig|7;Discrete Mathematics and Its Applications|Kenneth Rosen|7";
function seed(){var t=today();
 var books=RAW.split(";").map(function(r,i){var p=r.split("|");return{id:i+1,title:p[0],author:p[1],cat:CATS[+p[2]],copies:1+(i*7)%4}});
 return{books:books,
 members:[{id:1,name:"Asha Patil",email:"asha@example.com",pw:"student123"},{id:2,name:"Rohan Deshmukh",email:"rohan@example.com",pw:"student123"},{id:3,name:"Meera Joshi",email:"meera@example.com",pw:"student123"}],
 loans:[{id:1,bookId:1,memberId:1,issued:addDays(t,-20),due:addDays(t,-6),returned:null},{id:2,bookId:13,memberId:2,issued:addDays(t,-3),due:addDays(t,11),returned:null}]}}
var db=load();
function load(){try{var s=localStorage.getItem(KEY);if(s)return JSON.parse(s)}catch(e){}return seed()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}
function today(){return new Date().toISOString().slice(0,10)}
function addDays(d,n){var x=new Date(d+"T00:00:00Z");x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}
function diff(a,b){return Math.round((new Date(b+"T00:00:00Z")-new Date(a+"T00:00:00Z"))/864e5)}
function fmt(d){return new Date(d+"T00:00:00Z").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"})}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function nid(a){return a.reduce(function(m,x){return Math.max(m,x.id)},0)+1}
function $(id){return document.getElementById(id)}
function toast(m){var t=$("toast");t.textContent=m;t.className="show";clearTimeout(toast.h);toast.h=setTimeout(function(){t.className=""},2600)}
function active(){return db.loans.filter(function(l){return!l.returned})}
function avail(b){return b.copies-active().filter(function(l){return l.bookId===b.id}).length}
function book(id){return db.books.find(function(b){return b.id===id})}
function mem(id){return db.members.find(function(m){return m.id===id})}
function fine(l){return Math.max(0,diff(l.due,l.returned||today()))*FINE}
function hue(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h}

/* login */
(function(){var h=[210,28,262,170,340,45,195,300,12,230,150,80,320,200],w="";
 for(var i=0;i<22;i++)w+='<i style="height:'+(90+(i*37)%100)+'px;background:hsl('+h[i%h.length]+',55%,52%)"></i>';$("shelf").innerHTML=w})();
function showApp(){$("login").hidden=!!user;$("app").hidden=!user;if(user){tab=user.role==="student"?"books":"dashboard";$("who").textContent="Signed in as "+user.name+(user.role==="student"?" (student)":" (admin)");render()}}
try{user=JSON.parse(sessionStorage.getItem(SKEY))}catch(e){user=null}
function setRole(r){role=r;[].forEach.call(document.querySelectorAll("#seg button"),function(b){b.setAttribute("aria-pressed",b.dataset.role===r)});$("ulabel").firstChild.nodeValue=r==="admin"?"Username":"Student email";$("err").textContent=""}
$("seg").addEventListener("click",function(e){var b=e.target.closest("button");if(b)setRole(b.dataset.role)});
setRole("admin");
$("f-login").addEventListener("submit",function(e){e.preventDefault();
 var u=this.u.value.trim().toLowerCase(),p=this.p.value,found=null;
 if(role==="admin"){var a=USERS[u];if(a&&a.pw===p)found={role:"admin",name:a.name}}
 else{var m=db.members.find(function(x){return x.email.toLowerCase()===u&&x.pw===p});if(m)found={role:"student",name:m.name,id:m.id}}
 if(!found){$("err").textContent="Wrong "+(role==="admin"?"username":"email")+" or password. Check both and try again.";return}
 user=found;try{sessionStorage.setItem(SKEY,JSON.stringify(found))}catch(x){}this.reset();showApp()});
$("logout").addEventListener("click",function(){user=null;try{sessionStorage.removeItem(SKEY)}catch(e){}showApp()});

/* views */
function dash(){var act=active(),over=act.filter(function(l){return l.due<today()});
 var pend=over.reduce(function(s,l){return s+fine(l)},0),total=db.books.reduce(function(s,b){return s+b.copies},0);
 var h='<div class="stats"><div class="stat"><b>'+db.books.length+'</b><span>Titles ('+total+' copies)</span></div><div class="stat"><b>'+act.length+'</b><span>Books on loan</span></div><div class="stat"><b>'+db.members.length+'</b><span>Members</span></div><div class="stat '+(over.length?"alert":"")+'"><b>'+over.length+'</b><span>Overdue loans</span></div><div class="stat"><b>₹'+pend+'</b><span>Fines pending</span></div></div>';
 var mx=Math.max.apply(null,CATS.map(function(c){return db.books.filter(function(b){return b.cat===c}).length}))||1;
 h+='<div class="panel"><h2 class="sec">Titles by subject</h2>'+CATS.map(function(c){var n=db.books.filter(function(b){return b.cat===c}).length;return'<div class="cat"><span>'+c+'</span><div><i style="width:'+n/mx*100+'%"></i></div><b>'+n+'</b></div>'}).join("")+'</div>';
 h+='<div class="panel"><h2 class="sec">Overdue now</h2>'+(over.length?'<div class="tablebox"><table><tr><th>Book</th><th>Member</th><th>Due</th><th>Fine so far</th></tr>'+over.map(function(l){return'<tr><td>'+esc(book(l.bookId).title)+'</td><td>'+esc(mem(l.memberId).name)+'</td><td>'+fmt(l.due)+'</td><td class="bad">₹'+fine(l)+'</td></tr>'}).join("")+'</table></div>':'<div class="empty">Nothing is overdue.</div>')+'</div>';
 return h}

function books(){var q=search.toLowerCase();
 var list=db.books.filter(function(b){return(cat==="All"||b.cat===cat)&&(b.title+b.author).toLowerCase().indexOf(q)>-1});
 var adm=user.role==="admin";var h=!adm?"":'<div class="panel"><h2 class="sec">Add a book</h2><form class="row" id="f-book"><label>Title<input name="title" required></label><label>Author<input name="author" required></label><label>Subject<select name="cat">'+CATS.map(function(c){return'<option>'+c+'</option>'}).join("")+'</select></label><label style="flex:0 1 90px">Copies<input name="copies" type="number" min="1" value="1" required></label><button class="btn">Add book</button></form></div>';
 h+='<div class="bar"><input id="search" type="search" placeholder="Search title or author" aria-label="Search books" value="'+esc(search)+'"></div><div class="chips">'+["All"].concat(CATS).map(function(c){return'<button class="chip" data-cat="'+esc(c)+'" aria-pressed="'+(c===cat)+'">'+c+'</button>'}).join("")+'</div>';
 h+=list.length?'<div class="grid">'+list.map(function(b){var a=avail(b),k=hue(b.title);return'<article class="book"><div class="cover" style="background:linear-gradient(150deg,hsl('+k+',55%,38%),hsl('+(k+40)%360+',60%,28%))"><small>'+esc(b.cat)+'</small>'+esc(b.title)+'</div><div class="binfo"><span>'+esc(b.author)+'</span><span class="tag '+(a?"ok":"bad")+'" style="align-self:flex-start">'+a+' of '+b.copies+' in</span>'+(adm?'<button class="btn ghost danger" data-del-book="'+b.id+'">Delete</button>':'')+'</div></article>'}).join("")+'</div>':'<div class="empty">No books match. Clear the search or pick another subject.</div>';
 return h}

function members(){
 var h='<div class="panel"><h2 class="sec">Add a member</h2><form class="row" id="f-member"><label>Full name<input name="name" required></label><label>Email<input name="email" type="email" required></label><label>Password<input name="pw" minlength="4" required></label><button class="btn">Add member</button></form></div>';
 return h+'<div class="panel"><h2 class="sec">Members</h2>'+(db.members.length?'<div class="tablebox"><table><tr><th>Name</th><th>Email</th><th>Books out</th><th></th></tr>'+db.members.map(function(m){var n=active().filter(function(l){return l.memberId===m.id}).length;return'<tr><td><b>'+esc(m.name)+'</b></td><td>'+esc(m.email)+'</td><td>'+n+'</td><td><button class="btn ghost danger" data-del-member="'+m.id+'">Delete</button></td></tr>'}).join("")+'</table></div>':'<div class="empty">No members yet. Add one above.</div>')+'</div>'}

function circ(){var ab=db.books.filter(function(b){return avail(b)>0});
 var h='<div class="panel"><h2 class="sec">Issue a book</h2>';
 h+=(!ab.length||!db.members.length)?'<div class="empty">'+(db.members.length?'No copies are available right now.':'Add a member first.')+'</div>':'<form class="row" id="f-issue"><label>Book<select name="book">'+ab.map(function(b){return'<option value="'+b.id+'">'+esc(b.title)+' ('+avail(b)+' in)</option>'}).join("")+'</select></label><label>Member<select name="member">'+db.members.map(function(m){return'<option value="'+m.id+'">'+esc(m.name)+'</option>'}).join("")+'</select></label><button class="btn">Issue for '+DAYS+' days</button></form>';
 var act=active();
 h+='</div><div class="panel"><h2 class="sec">On loan</h2>'+(act.length?'<div class="tablebox"><table><tr><th>Book</th><th>Member</th><th>Due</th><th>Status</th><th></th></tr>'+act.map(function(l){var o=l.due<today();return'<tr><td>'+esc(book(l.bookId).title)+'</td><td>'+esc(mem(l.memberId).name)+'</td><td>'+fmt(l.due)+'</td><td>'+(o?'<span class="tag bad">Overdue: ₹'+fine(l)+'</span>':'<span class="tag ok">On time</span>')+'</td><td><button class="btn ghost" data-return="'+l.id+'">Return</button></td></tr>'}).join("")+'</table></div>':'<div class="empty">No books are on loan.</div>')+'</div>';
 var done=db.loans.filter(function(l){return l.returned}).reverse().slice(0,15);
 h+='<div class="panel"><h2 class="sec">Recently returned</h2>'+(done.length?'<div class="tablebox"><table><tr><th>Book</th><th>Member</th><th>Returned</th><th>Fine</th></tr>'+done.map(function(l){var f=fine(l),b=book(l.bookId),m=mem(l.memberId);return'<tr><td>'+esc(b?b.title:"Deleted book")+'</td><td>'+esc(m?m.name:"Deleted member")+'</td><td>'+fmt(l.returned)+'</td><td class="'+(f?"warn":"muted")+'">'+(f?"₹"+f:"None")+'</td></tr>'}).join("")+'</table></div>':'<div class="empty">Returned books will appear here.</div>')+'</div>';
 return h}

function myloans(){var mine=db.loans.filter(function(l){return l.memberId===user.id});
 var act=mine.filter(function(l){return!l.returned}),over=act.filter(function(l){return l.due<today()});
 var owed=act.reduce(function(s,l){return s+fine(l)},0),done=mine.filter(function(l){return l.returned}).reverse();
 var h='<div class="stats"><div class="stat"><b>'+act.length+'</b><span>Books borrowed</span></div><div class="stat '+(over.length?"alert":"")+'"><b>'+over.length+'</b><span>Overdue</span></div><div class="stat"><b>₹'+owed+'</b><span>Fine so far</span></div></div>';
 h+='<div class="panel"><h2 class="sec">Borrowed now</h2>'+(act.length?'<div class="tablebox"><table><tr><th>Book</th><th>Issued</th><th>Due</th><th>Status</th></tr>'+act.map(function(l){var o=l.due<today();return'<tr><td>'+esc(book(l.bookId).title)+'</td><td>'+fmt(l.issued)+'</td><td>'+fmt(l.due)+'</td><td>'+(o?'<span class="tag bad">Overdue: ₹'+fine(l)+'</span>':'<span class="tag ok">On time</span>')+'</td></tr>'}).join("")+'</table></div>':'<div class="empty">You have no books out. Browse the catalogue and ask the desk to issue one.</div>')+'</div>';
 h+='<div class="panel"><h2 class="sec">Past loans</h2>'+(done.length?'<div class="tablebox"><table><tr><th>Book</th><th>Returned</th><th>Fine</th></tr>'+done.map(function(l){var f=fine(l),b=book(l.bookId);return'<tr><td>'+esc(b?b.title:"Deleted book")+'</td><td>'+fmt(l.returned)+'</td><td class="'+(f?"warn":"muted")+'">'+(f?"₹"+f:"None")+'</td></tr>'}).join("")+'</table></div>':'<div class="empty">Returned books will appear here.</div>')+'</div>';
 return h}
function render(){$("nav").innerHTML=(user.role==="student"?STABS:TABS).map(function(t){return'<button role="tab" data-tab="'+t[0]+'" aria-selected="'+(t[0]===tab)+'">'+t[1]+'</button>'}).join("");
 $("view").innerHTML={dashboard:dash,books:books,members:members,circulation:circ,myloans:myloans}[tab]()}

document.addEventListener("click",function(e){var t=e.target.closest("button");if(!t)return;var d=t.dataset;
 if(d.tab){tab=d.tab;search="";cat="All";render();window.scrollTo(0,0)}
 if(d.cat){cat=d.cat;render()}
 if(d.delBook){var id=+d.delBook;if(active().some(function(l){return l.bookId===id}))return toast("Return all copies before deleting this book.");
  if(!confirm("Delete this book?"))return;db.books=db.books.filter(function(b){return b.id!==id});save();render();toast("Book deleted.")}
 if(d.delMember){var m=+d.delMember;if(active().some(function(l){return l.memberId===m}))return toast("This member still has books on loan.");
  if(!confirm("Delete this member?"))return;db.members=db.members.filter(function(x){return x.id!==m});save();render();toast("Member deleted.")}
 if(d.return){var l=db.loans.find(function(x){return x.id===+d.return});l.returned=today();save();render();var f=fine(l);toast(f?"Returned. Fine due: ₹"+f:"Returned. No fine.")}});
document.addEventListener("submit",function(e){var f=e.target;if(f.id==="f-login")return;e.preventDefault();var d=new FormData(f);
 if(f.id==="f-book"){db.books.unshift({id:nid(db.books),title:d.get("title").trim(),author:d.get("author").trim(),cat:d.get("cat"),copies:Math.max(1,+d.get("copies")||1)});save();render();toast("Book added.")}
 if(f.id==="f-member"){db.members.push({id:nid(db.members),name:d.get("name").trim(),email:d.get("email").trim(),pw:d.get("pw")});save();render();toast("Member added.")}
 if(f.id==="f-issue"){var b=book(+d.get("book"));if(avail(b)<1)return toast("No copies available.");
  db.loans.push({id:nid(db.loans),bookId:b.id,memberId:+d.get("member"),issued:today(),due:addDays(today(),DAYS),returned:null});save();render();toast("Book issued. Due "+fmt(addDays(today(),DAYS))+".")}});
document.addEventListener("input",function(e){if(e.target.id==="search"){search=e.target.value;var p=e.target.selectionStart;render();var s=$("search");s.focus();s.setSelectionRange(p,p)}});
showApp();
})();