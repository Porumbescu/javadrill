import { useState, useEffect, useCallback, useRef, useReducer, useMemo } from "react";

const CATEGORIES = {
  core:        { name: "Core Java",       icon: "☕", color: "#f97316", desc: "Fundamentals, types, keywords" },
  oop:         { name: "OOP",             icon: "🧬", color: "#a855f7", desc: "Pillars, design, abstraction" },
  collections: { name: "Collections",     icon: "📦", color: "#3b82f6", desc: "Lists, Maps, Sets, Queues" },
  concurrency: { name: "Concurrency",     icon: "⚡", color: "#eab308", desc: "Threads, locks, executors" },
  jvm:         { name: "JVM Internals",   icon: "🧠", color: "#ec4899", desc: "Memory, GC, classloading" },
  exceptions:  { name: "Exceptions",      icon: "🛡️", color: "#14b8a6", desc: "Error handling, try-catch" },
  java8:       { name: "Java 8+",         icon: "🚀", color: "#6366f1", desc: "Streams, lambdas, optionals" },
  patterns:    { name: "Design Patterns", icon: "🏗️", color: "#f43f5e", desc: "Singleton, Factory, Observer" },
  spring:      { name: "Spring",          icon: "🌱", color: "#22c55e", desc: "DI, Boot, annotations" },
};

const Q = [
  { id:"c01", cat:"core", diff:1, type:"pick1of4", q:"What is the default value of an `int` variable in Java?", options:["0","null","1","undefined"], answer:0 },
  { id:"c02", cat:"core", diff:1, type:"truefalse", q:"`String` objects in Java are mutable.", answer:false, explanation:"Strings are immutable. Once created, their value cannot change. Use StringBuilder for mutable text." },
  { id:"c03", cat:"core", diff:2, type:"fillblank", q:"To make a variable constant in Java, use the `____` keyword.", answer:"final", accept:["final"] },
  { id:"c04", cat:"core", diff:1, type:"pick1of4", q:"Which operator compares object references, not values?", options:["==",".equals()","compareTo()",".compare()"], answer:0 },
  { id:"c05", cat:"core", diff:2, type:"pick1of4", q:"Which class is thread-safe for string manipulation?", options:["String","StringBuilder","StringBuffer","CharSequence"], answer:2 },
  { id:"c06", cat:"core", diff:1, type:"truefalse", q:"Java supports multiple inheritance of classes.", answer:false, explanation:"Java only supports single class inheritance. Multiple inheritance is achieved through interfaces." },
  { id:"c07", cat:"core", diff:2, type:"fillblank", q:"The `____` keyword is used to refer to the current object instance.", answer:"this", accept:["this"] },
  { id:"c08", cat:"core", diff:1, type:"pick1of4", q:"What is the size of an `int` in Java?", options:["16 bits","32 bits","64 bits","Depends on platform"], answer:1 },
  { id:"c09", cat:"core", diff:2, type:"match", q:"Match each primitive type to its wrapper class:", pairs:[{l:"int",r:"Integer"},{l:"char",r:"Character"},{l:"boolean",r:"Boolean"},{l:"double",r:"Double"}]},
  { id:"c10", cat:"core", diff:2, type:"pick1of4", q:"What does autoboxing do?", options:["Converts primitive to wrapper automatically","Converts wrapper to primitive","Casts between types","Creates a new object pool"], answer:0 },
  { id:"c11", cat:"core", diff:1, type:"truefalse", q:"The `static` keyword means the member belongs to the class, not to instances.", answer:true, explanation:"Static members are shared across all instances and can be accessed without creating an object." },
  { id:"c12", cat:"core", diff:3, type:"fillblank", q:"The `____` block always executes whether or not an exception is thrown.", answer:"finally", accept:["finally"] },
  { id:"c13", cat:"core", diff:2, type:"pick1of4", q:"Which access modifier makes a member visible only within its own class?", options:["public","protected","private","default"], answer:2 },
  { id:"c14", cat:"core", diff:2, type:"order", q:"Arrange these access modifiers from most restrictive to least restrictive:", items:["private","default (package)","protected","public"], correctOrder:[0,1,2,3] },

  { id:"o01", cat:"oop", diff:1, type:"pick1of4", q:"Which OOP concept hides internal details and exposes only what's necessary?", options:["Inheritance","Polymorphism","Encapsulation","Abstraction"], answer:3 },
  { id:"o02", cat:"oop", diff:2, type:"truefalse", q:"An abstract class can have constructors.", answer:true, explanation:"Abstract classes can have constructors which are called when a concrete subclass is instantiated." },
  { id:"o03", cat:"oop", diff:1, type:"pick1of4", q:"What keyword is used to inherit from a class?", options:["implements","extends","inherits","super"], answer:1 },
  { id:"o04", cat:"oop", diff:2, type:"fillblank", q:"Method ________ means having methods with the same name but different parameters in the same class.", answer:"overloading", accept:["overloading","overload"] },
  { id:"o05", cat:"oop", diff:2, type:"pick1of4", q:"Which is an example of runtime polymorphism?", options:["Method overloading","Method overriding","Constructor chaining","Static methods"], answer:1 },
  { id:"o06", cat:"oop", diff:2, type:"match", q:"Match the OOP concept to its description:", pairs:[{l:"Encapsulation",r:"Bundling data with methods"},{l:"Inheritance",r:"Creating classes from existing ones"},{l:"Polymorphism",r:"Objects taking many forms"},{l:"Abstraction",r:"Hiding complexity"}]},
  { id:"o07", cat:"oop", diff:3, type:"pick1of4", q:"In SOLID, what does the 'L' stand for?", options:["Loose Coupling","Liskov Substitution","Lazy Initialization","Logical Separation"], answer:1 },
  { id:"o08", cat:"oop", diff:2, type:"truefalse", q:"A class can implement multiple interfaces in Java.", answer:true, explanation:"Java supports multiple interface implementation, which is how it compensates for the lack of multiple class inheritance." },
  { id:"o09", cat:"oop", diff:2, type:"fillblank", q:"The @________ annotation helps catch method overriding mistakes at compile time.", answer:"Override", accept:["Override","override"] },
  { id:"o10", cat:"oop", diff:2, type:"pick1of4", q:"What is the preferred relationship type in 'composition over inheritance'?", options:["is-a","has-a","uses-a","knows-a"], answer:1 },
  { id:"o11", cat:"oop", diff:3, type:"order", q:"Arrange SOLID principles in the correct order of the acronym:", items:["Single Responsibility","Open/Closed","Liskov Substitution","Interface Segregation"], correctOrder:[0,1,2,3] },
  { id:"o12", cat:"oop", diff:1, type:"truefalse", q:"Interfaces cannot have any method implementations in Java.", answer:false, explanation:"Since Java 8, interfaces can have default and static methods with implementations." },

  { id:"cl01", cat:"collections", diff:1, type:"pick1of4", q:"Which collection maintains insertion order and allows duplicates?", options:["HashSet","ArrayList","TreeMap","HashMap"], answer:1 },
  { id:"cl02", cat:"collections", diff:2, type:"truefalse", q:"`HashMap` allows one null key and multiple null values.", answer:true, explanation:"HashMap permits one null key and any number of null values, unlike Hashtable or ConcurrentHashMap." },
  { id:"cl03", cat:"collections", diff:2, type:"pick1of4", q:"What data structure does HashMap use to handle collisions (Java 8+)?", options:["Only linked list","Only red-black tree","Linked list, then red-black tree at threshold","Array of arrays"], answer:2 },
  { id:"cl04", cat:"collections", diff:1, type:"fillblank", q:"To ensure thread safety with a Map, use Concurrent______Map.", answer:"Hash", accept:["Hash","hash","HashMap"] },
  { id:"cl05", cat:"collections", diff:2, type:"match", q:"Match each collection to its key property:", pairs:[{l:"ArrayList",r:"O(1) random access"},{l:"LinkedList",r:"O(1) insert at ends"},{l:"HashSet",r:"No duplicates, unordered"},{l:"TreeMap",r:"Sorted by keys"}]},
  { id:"cl06", cat:"collections", diff:2, type:"pick1of4", q:"Which interface should a class implement to define its natural ordering?", options:["Comparator","Comparable","Iterable","Serializable"], answer:1 },
  { id:"cl07", cat:"collections", diff:1, type:"truefalse", q:"`TreeSet` maintains elements in insertion order.", answer:false, explanation:"TreeSet maintains elements in sorted (natural or custom) order, not insertion order. LinkedHashSet keeps insertion order." },
  { id:"cl08", cat:"collections", diff:2, type:"pick1of4", q:"What is the default load factor of a HashMap?", options:["0.5","0.6","0.75","1.0"], answer:2 },
  { id:"cl09", cat:"collections", diff:2, type:"fillblank", q:"The ________ interface extends Collection and does not allow duplicate elements.", answer:"Set", accept:["Set","set"] },
  { id:"cl10", cat:"collections", diff:3, type:"pick1of4", q:"At what bucket threshold does HashMap convert a linked list to a red-black tree?", options:["4","6","8","16"], answer:2 },
  { id:"cl11", cat:"collections", diff:2, type:"order", q:"Arrange these in order from fastest to slowest for random element access:", items:["ArrayList","LinkedHashMap","LinkedList","TreeMap"], correctOrder:[0,1,2,3] },

  { id:"cn01", cat:"concurrency", diff:2, type:"pick1of4", q:"What keyword ensures a variable's value is always read from main memory?", options:["synchronized","volatile","transient","atomic"], answer:1 },
  { id:"cn02", cat:"concurrency", diff:2, type:"truefalse", q:"`volatile` provides atomicity for compound operations like `i++`.", answer:false, explanation:"volatile only ensures visibility, not atomicity. Use AtomicInteger or synchronized for compound operations." },
  { id:"cn03", cat:"concurrency", diff:1, type:"pick1of4", q:"Which is preferred for defining a task: extending Thread or implementing Runnable?", options:["Extending Thread","Implementing Runnable","Both are equally preferred","Neither"], answer:1 },
  { id:"cn04", cat:"concurrency", diff:2, type:"fillblank", q:"A ________ occurs when two threads are each waiting for the other's lock.", answer:"deadlock", accept:["deadlock","Deadlock","dead lock"] },
  { id:"cn05", cat:"concurrency", diff:2, type:"match", q:"Match each concept to its description:", pairs:[{l:"wait()",r:"Releases lock, waits for notify"},{l:"sleep()",r:"Pauses thread, holds lock"},{l:"volatile",r:"Ensures memory visibility"},{l:"synchronized",r:"Mutual exclusion block"}]},
  { id:"cn06", cat:"concurrency", diff:3, type:"pick1of4", q:"Which is NOT a required condition for deadlock?", options:["Mutual exclusion","Hold and wait","Starvation","Circular wait"], answer:2 },
  { id:"cn07", cat:"concurrency", diff:2, type:"truefalse", q:"`wait()` must be called inside a synchronized block.", answer:true, explanation:"Calling wait() outside a synchronized block throws IllegalMonitorStateException." },
  { id:"cn08", cat:"concurrency", diff:2, type:"pick1of4", q:"Which class provides a thread-safe counter without using synchronized?", options:["Integer","volatile int","AtomicInteger","SyncCounter"], answer:2 },
  { id:"cn09", cat:"concurrency", diff:3, type:"order", q:"Arrange the thread lifecycle states in order:", items:["NEW","RUNNABLE","RUNNING","TERMINATED"], correctOrder:[0,1,2,3] },
  { id:"cn10", cat:"concurrency", diff:2, type:"fillblank", q:"The ________ framework provides thread pool management via Executors.", answer:"ExecutorService", accept:["ExecutorService","Executor","executor","executorservice"] },

  { id:"j01", cat:"jvm", diff:2, type:"pick1of4", q:"Where are objects stored in JVM memory?", options:["Stack","Heap","Method Area","Program Counter"], answer:1 },
  { id:"j02", cat:"jvm", diff:2, type:"truefalse", q:"Each thread has its own stack in the JVM.", answer:true, explanation:"Each thread gets its own stack for storing local variables and method call frames. The heap is shared." },
  { id:"j03", cat:"jvm", diff:2, type:"match", q:"Match each JVM area to what it stores:", pairs:[{l:"Heap",r:"Objects and arrays"},{l:"Stack",r:"Local variables and frames"},{l:"Metaspace",r:"Class metadata"},{l:"PC Register",r:"Current instruction address"}]},
  { id:"j04", cat:"jvm", diff:3, type:"pick1of4", q:"Which garbage collector is the default since Java 9?", options:["Serial GC","Parallel GC","G1 GC","ZGC"], answer:2 },
  { id:"j05", cat:"jvm", diff:2, type:"fillblank", q:"When the stack runs out of space, Java throws a Stack________Error.", answer:"Overflow", accept:["Overflow","overflow","OverflowError"] },
  { id:"j06", cat:"jvm", diff:3, type:"order", q:"Arrange the classloader hierarchy from parent to child:", items:["Bootstrap ClassLoader","Platform ClassLoader","Application ClassLoader","Custom ClassLoader"], correctOrder:[0,1,2,3] },
  { id:"j07", cat:"jvm", diff:2, type:"pick1of4", q:"What triggers garbage collection for an object?", options:["Calling delete()","Setting reference to null","Object becomes unreachable","Calling System.gc() (guaranteed)"], answer:2 },
  { id:"j08", cat:"jvm", diff:2, type:"truefalse", q:"You can guarantee when garbage collection will run by calling System.gc().", answer:false, explanation:"System.gc() is only a suggestion to the JVM. There's no way to force garbage collection." },
  { id:"j09", cat:"jvm", diff:3, type:"pick1of4", q:"Which tool can help detect memory leaks in a Java application?", options:["javac","javadoc","VisualVM","jar"], answer:2 },
  { id:"j10", cat:"jvm", diff:2, type:"fillblank", q:"Since Java 8, class metadata is stored in ________ instead of PermGen.", answer:"Metaspace", accept:["Metaspace","metaspace","MetaSpace"] },

  { id:"e01", cat:"exceptions", diff:1, type:"pick1of4", q:"Which type of exception MUST be caught or declared?", options:["Unchecked","Checked","Error","RuntimeException"], answer:1 },
  { id:"e02", cat:"exceptions", diff:1, type:"truefalse", q:"`NullPointerException` is a checked exception.", answer:false, explanation:"NullPointerException extends RuntimeException, making it unchecked." },
  { id:"e03", cat:"exceptions", diff:2, type:"fillblank", q:"The try-with-________ statement automatically closes resources.", answer:"resources", accept:["resources","Resources"] },
  { id:"e04", cat:"exceptions", diff:2, type:"match", q:"Match each exception type to its category:", pairs:[{l:"IOException",r:"Checked"},{l:"NullPointerException",r:"Unchecked"},{l:"OutOfMemoryError",r:"Error"},{l:"ArrayIndexOutOfBoundsException",r:"Unchecked"}]},
  { id:"e05", cat:"exceptions", diff:1, type:"pick1of4", q:"Which keyword is used inside a method body to throw an exception?", options:["throws","throw","catch","raise"], answer:1 },
  { id:"e06", cat:"exceptions", diff:2, type:"truefalse", q:"A finally block will NOT execute if System.exit() is called in the try block.", answer:true, explanation:"System.exit() terminates the JVM immediately, preventing the finally block from executing." },
  { id:"e07", cat:"exceptions", diff:2, type:"pick1of4", q:"What is the root class of all exceptions and errors?", options:["Exception","Error","Throwable","Object"], answer:2 },
  { id:"e08", cat:"exceptions", diff:2, type:"order", q:"Arrange the exception hierarchy from top to bottom:", items:["Throwable","Exception","RuntimeException","NullPointerException"], correctOrder:[0,1,2,3] },
  { id:"e09", cat:"exceptions", diff:2, type:"fillblank", q:"Custom exceptions should extend ________ or RuntimeException.", answer:"Exception", accept:["Exception","exception"] },
  { id:"e10", cat:"exceptions", diff:2, type:"pick1of4", q:"Which interface must a resource implement to be used with try-with-resources?", options:["Closeable","Serializable","AutoCloseable","Disposable"], answer:2 },

  { id:"j81", cat:"java8", diff:1, type:"pick1of4", q:"What is the correct lambda syntax for a no-argument function?", options:["-> {}","() -> {}","=> {}","lambda {}"], answer:1 },
  { id:"j82", cat:"java8", diff:2, type:"truefalse", q:"Streams in Java store data like a collection.", answer:false, explanation:"Streams don't store data. They process data from a source on demand." },
  { id:"j83", cat:"java8", diff:2, type:"fillblank", q:"Optional.______() creates an Optional that may or may not have a value.", answer:"ofNullable", accept:["ofNullable","ofnullable"] },
  { id:"j84", cat:"java8", diff:2, type:"pick1of4", q:"Which functional interface takes a value and returns a boolean?", options:["Function","Consumer","Predicate","Supplier"], answer:2 },
  { id:"j85", cat:"java8", diff:2, type:"match", q:"Match each functional interface to its signature:", pairs:[{l:"Predicate<T>",r:"T → boolean"},{l:"Function<T,R>",r:"T → R"},{l:"Consumer<T>",r:"T → void"},{l:"Supplier<T>",r:"() → T"}]},
  { id:"j86", cat:"java8", diff:1, type:"pick1of4", q:"Which stream operation triggers execution of the pipeline?", options:["filter()","map()","sorted()","collect()"], answer:3 },
  { id:"j87", cat:"java8", diff:2, type:"truefalse", q:"`flatMap()` is used to flatten nested streams into a single stream.", answer:true, explanation:"flatMap maps each element to a stream and then flattens all resulting streams into one." },
  { id:"j88", cat:"java8", diff:2, type:"fillblank", q:"A method reference to a static method uses the syntax ClassName::________.", answer:"methodName", accept:["methodName","methodname","staticMethod","staticMethodName","method"] },
  { id:"j89", cat:"java8", diff:2, type:"order", q:"Arrange these stream operations in the correct pipeline order:", items:["stream()","filter()","map()","collect()"], correctOrder:[0,1,2,3] },
  { id:"j810", cat:"java8", diff:2, type:"pick1of4", q:"What annotation marks an interface as a functional interface?", options:["@Lambda","@FunctionalInterface","@SingleMethod","@SAM"], answer:1 },

  { id:"p01", cat:"patterns", diff:2, type:"pick1of4", q:"Which Singleton implementation is considered the safest in Java?", options:["Lazy initialization","Double-checked locking","Enum singleton","Static block"], answer:2 },
  { id:"p02", cat:"patterns", diff:1, type:"truefalse", q:"The Factory pattern exposes object creation logic directly to the client.", answer:false, explanation:"Factory hides creation logic. The client uses an interface and the factory decides which concrete class to instantiate." },
  { id:"p03", cat:"patterns", diff:2, type:"fillblank", q:"In the Observer pattern, when the subject changes, all ________ are notified.", answer:"observers", accept:["observers","Observers","observer","listeners"] },
  { id:"p04", cat:"patterns", diff:2, type:"match", q:"Match each pattern to its purpose:", pairs:[{l:"Singleton",r:"Ensure one instance"},{l:"Factory",r:"Create objects without exposing logic"},{l:"Observer",r:"Notify on state change"},{l:"Builder",r:"Construct complex objects step-by-step"}]},
  { id:"p05", cat:"patterns", diff:2, type:"pick1of4", q:"Which pattern uses method chaining to construct complex objects?", options:["Factory","Builder","Prototype","Adapter"], answer:1 },
  { id:"p06", cat:"patterns", diff:2, type:"truefalse", q:"The Strategy pattern eliminates the need for conditional algorithm selection.", answer:true, explanation:"Strategy encapsulates algorithms into interchangeable classes, replacing if/switch statements with polymorphism." },
  { id:"p07", cat:"patterns", diff:2, type:"pick1of4", q:"Which pattern converts the interface of a class into one that clients expect?", options:["Bridge","Decorator","Adapter","Proxy"], answer:2 },
  { id:"p08", cat:"patterns", diff:3, type:"fillblank", q:"The ________ pattern adds behavior to objects dynamically without altering their class.", answer:"Decorator", accept:["Decorator","decorator"] },
  { id:"p09", cat:"patterns", diff:2, type:"order", q:"Arrange Builder pattern steps in typical usage order:", items:["new Builder()","setField1()","setField2()","build()"], correctOrder:[0,1,2,3] },

  { id:"s01", cat:"spring", diff:1, type:"pick1of4", q:"Which injection type is recommended by Spring?", options:["Field injection","Setter injection","Constructor injection","Method injection"], answer:2 },
  { id:"s02", cat:"spring", diff:1, type:"truefalse", q:"`@Component` and `@Service` behave identically at runtime.", answer:true, explanation:"@Service is just a specialized @Component. The difference is semantic." },
  { id:"s03", cat:"spring", diff:2, type:"fillblank", q:"The default scope of a Spring bean is ________.", answer:"singleton", accept:["singleton","Singleton"] },
  { id:"s04", cat:"spring", diff:2, type:"match", q:"Match each annotation to its layer:", pairs:[{l:"@Controller",r:"Web / Presentation"},{l:"@Service",r:"Business Logic"},{l:"@Repository",r:"Data Access"},{l:"@Component",r:"Generic"}]},
  { id:"s05", cat:"spring", diff:2, type:"pick1of4", q:"What does @Transactional(propagation = REQUIRES_NEW) do?", options:["Joins existing transaction","Always creates a new transaction","Runs without any transaction","Throws if no transaction exists"], answer:1 },
  { id:"s06", cat:"spring", diff:1, type:"truefalse", q:"Spring Boot requires an external application server like Tomcat to be installed.", answer:false, explanation:"Spring Boot includes an embedded server (Tomcat by default)." },
  { id:"s07", cat:"spring", diff:2, type:"pick1of4", q:"Which annotation makes @Repository translate persistence exceptions?", options:["@Repository itself","@Service","@PersistenceExceptionTranslation","@Transactional"], answer:0 },
  { id:"s08", cat:"spring", diff:2, type:"fillblank", q:"Spring Boot uses ________ to reduce boilerplate configuration.", answer:"auto-configuration", accept:["auto-configuration","autoconfiguration","auto configuration","AutoConfiguration","autoconfig"] },
  { id:"s09", cat:"spring", diff:2, type:"order", q:"Arrange the Spring Bean lifecycle phases:", items:["Instantiation","Dependency Injection","@PostConstruct","@PreDestroy"], correctOrder:[0,1,2,3] },
  { id:"s10", cat:"spring", diff:2, type:"pick1of4", q:"What lifecycle callback annotation replaces InitializingBean?", options:["@Init","@PostConstruct","@AfterInit","@Setup"], answer:1 },
];

const ACHIEVEMENTS = [
  { id:"first", name:"First Steps", desc:"Answer your first question", icon:"🎯", check:s=>s.total>=1 },
  { id:"ten", name:"Getting Warmed Up", desc:"Answer 10 questions", icon:"🔥", check:s=>s.total>=10 },
  { id:"fifty", name:"Dedicated", desc:"Answer 50 questions", icon:"📚", check:s=>s.total>=50 },
  { id:"hundred", name:"Centurion", desc:"Answer 100 questions", icon:"💯", check:s=>s.total>=100 },
  { id:"streak3", name:"Consistent", desc:"3-day streak", icon:"⚡", check:s=>s.streak>=3 },
  { id:"streak7", name:"Weekly Warrior", desc:"7-day streak", icon:"🗓️", check:s=>s.streak>=7 },
  { id:"streak30", name:"Monthly Master", desc:"30-day streak", icon:"👑", check:s=>s.streak>=30 },
  { id:"perfect1", name:"Flawless", desc:"Complete a session with no mistakes", icon:"✨", check:s=>s.perfectSessions>=1 },
  { id:"perfect5", name:"Sharpshooter", desc:"5 perfect sessions", icon:"💎", check:s=>s.perfectSessions>=5 },
  { id:"allcats", name:"Well Rounded", desc:"Practice every category", icon:"🌐", check:s=>Object.keys(s.catProg).length>=Object.keys(CATEGORIES).length },
  { id:"lvl5", name:"Rising Star", desc:"Reach level 5", icon:"⭐", check:s=>s.level>=5 },
  { id:"lvl10", name:"Veteran", desc:"Reach level 10", icon:"🏆", check:s=>s.level>=10 },
  { id:"lvl25", name:"Interview God", desc:"Reach level 25", icon:"👾", check:s=>s.level>=25 },
  { id:"daily1", name:"Daily Champion", desc:"Complete daily goal", icon:"🏅", check:s=>s.dailyDone>=1 },
  { id:"daily7", name:"Full Week", desc:"Complete daily goal 7 times", icon:"📅", check:s=>s.dailyDone>=7 },
  { id:"hard10", name:"Fearless", desc:"Answer 10 hard questions correctly", icon:"💪", check:s=>s.hardCorrect>=10 },
  { id:"speed", name:"Quick Draw", desc:"Answer 10 questions in under 3s", icon:"⏱️", check:s=>s.fastAnswers>=10 },
  { id:"sess10", name:"Grinder", desc:"Complete 10 sessions", icon:"🎮", check:s=>s.sessionsCompleted>=10 },
];

const DAILY_GOAL=5, SESSION_SIZE=10, XP_PER_LEVEL=200;
const RANKS=[{l:0,name:"Novice",b:"🟤"},{l:3,name:"Apprentice",b:"⚪"},{l:5,name:"Junior Dev",b:"🟢"},{l:10,name:"Mid-Level",b:"🔵"},{l:15,name:"Senior",b:"🟣"},{l:20,name:"Lead",b:"🟡"},{l:25,name:"Architect",b:"🔴"},{l:30,name:"Distinguished",b:"⚫"}];
const getRank=lv=>{let r=RANKS[0];for(const x of RANKS)if(lv>=x.l)r=x;return r;};
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}

const INIT={xp:0,level:1,streak:0,lastDate:null,total:0,correct:0,perfectSessions:0,dailyToday:0,dailyDone:0,todayDate:null,fastAnswers:0,hardCorrect:0,sessionsCompleted:0,catProg:{},badges:[],history:[],displayName:"Java Developer",joinDate:new Date().toISOString().split("T")[0]};

function reducer(st,act){
  switch(act.type){
    case "LOAD": return {...INIT,...act.p};
    case "SESSION_COMPLETE":{
      const{results,category}=act.p;const today=new Date().toISOString().split("T")[0];
      const cc=results.filter(r=>r.correct).length;const isPerfect=cc===results.length;
      const db=results.reduce((a,r)=>a+(r.correct?r.diff*5:0),0);
      const xp=cc*15+db+(isPerfect?30:0);const nxp=st.xp+xp;const nlv=Math.floor(nxp/XP_PER_LEVEL)+1;
      let ns2=st.streak;
      if(st.lastDate!==today){const y=new Date(Date.now()-86400000).toISOString().split("T")[0];ns2=st.lastDate===y?st.streak+1:1;}
      const dt=(st.todayDate===today?st.dailyToday:0)+cc;
      const wg=st.todayDate===today&&st.dailyToday>=DAILY_GOAL;const ig=dt>=DAILY_GOAL;
      const dd=st.dailyDone+(!wg&&ig?1:0);
      const cp={...st.catProg};if(!cp[category])cp[category]={ans:0,cor:0};
      cp[category]={ans:cp[category].ans+results.length,cor:cp[category].cor+cc};
      const fast=results.filter(r=>r.correct&&r.timeSec<3).length;
      const hard=results.filter(r=>r.correct&&r.diff>=3).length;
      const ns={...st,xp:nxp,level:nlv,streak:ns2,lastDate:today,todayDate:today,
        total:st.total+results.length,correct:st.correct+cc,
        perfectSessions:st.perfectSessions+(isPerfect?1:0),dailyToday:dt,dailyDone:dd,
        fastAnswers:st.fastAnswers+fast,hardCorrect:st.hardCorrect+hard,
        sessionsCompleted:st.sessionsCompleted+1,catProg:cp,
        history:[...st.history.slice(-200),{cat:category,correct:cc,total:results.length,date:today,xp}]};
      const nb=[...st.badges];for(const a of ACHIEVEMENTS)if(!nb.includes(a.id)&&a.check(ns))nb.push(a.id);
      ns.badges=nb;return ns;}
    case "SET_NAME": return {...st,displayName:act.p};
    case "CHECK_DAY":{const t=new Date().toISOString().split("T")[0];return st.todayDate!==t?{...st,todayDate:t,dailyToday:0}:st;}
    default:return st;
  }
}

const FONT="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap";
const CSS=`@import url('${FONT}');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#07070d;--bg2:#0d0d18;--bg3:#131322;--bg4:#1a1a30;--bg5:#22223a;--tx:#eaeaf4;--tx2:#9494b0;--tx3:#58587a;--acc:#00e5ff;--acc2:#7c4dff;--fire:#ff6d00;--gold:#ffd600;--ok:#00e676;--bad:#ff1744;--warn:#ffab00;--r:14px;--rs:8px}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--tx)}
h1,h2,h3,h4,h5{font-family:'Chakra Petch',sans-serif}
code{font-family:'Fira Code',monospace;background:var(--bg4);padding:1px 6px;border-radius:4px;font-size:0.9em}
.app{max-width:460px;margin:0 auto;min-height:100vh;padding:0 16px 90px;position:relative}
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:460px;background:var(--bg2);border-top:1px solid rgba(255,255,255,0.05);padding:8px 8px 18px;z-index:100;display:flex;justify-content:space-around}
.nb{background:none;border:none;color:var(--tx3);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;font-family:'DM Sans';padding:6px 10px;border-radius:var(--rs);transition:all 0.2s;font-weight:600}
.nb.on{color:var(--acc)}.nb:hover{color:var(--tx)}.ni{font-size:20px}
.card{background:var(--bg3);border:1px solid rgba(255,255,255,0.04);border-radius:var(--r);padding:18px;margin-bottom:10px}
.glow{box-shadow:0 0 24px rgba(0,229,255,0.06)}
.bar-bg{height:8px;background:var(--bg);border-radius:4px;overflow:hidden;width:100%}
.bar-fill{height:100%;border-radius:4px;transition:width 0.5s ease}
.btn{font-family:'Chakra Petch';font-weight:600;border:none;cursor:pointer;border-radius:var(--rs);padding:12px 22px;font-size:15px;transition:all 0.15s;display:inline-flex;align-items:center;gap:8px;justify-content:center}
.btn:active{transform:scale(0.97)}.bp{background:var(--acc);color:var(--bg)}.bp:hover{filter:brightness(1.15)}
.bs{background:var(--bg4);color:var(--tx);border:1px solid rgba(255,255,255,0.08)}.bs:hover{border-color:var(--acc)}
.bsm{padding:8px 14px;font-size:13px}.btn:disabled{opacity:0.35;cursor:not-allowed;transform:none}
.opt{width:100%;text-align:left;padding:14px 18px;background:var(--bg4);border:2px solid rgba(255,255,255,0.06);border-radius:var(--r);color:var(--tx);font-family:'DM Sans';font-size:14px;cursor:pointer;transition:all 0.15s;margin-bottom:8px;display:flex;align-items:center;gap:12px;font-weight:500;line-height:1.4}
.opt:hover:not(:disabled){border-color:var(--acc);background:rgba(0,229,255,0.05)}
.opt.sel{border-color:var(--acc);background:rgba(0,229,255,0.08)}
.opt.right{border-color:var(--ok);background:rgba(0,230,118,0.1);color:var(--ok)}
.opt.wrong{border-color:var(--bad);background:rgba(255,23,68,0.1);color:var(--bad)}
.opt:disabled{cursor:default}
.inp{background:var(--bg);border:2px solid rgba(255,255,255,0.08);border-radius:var(--rs);color:var(--tx);font-family:'Fira Code';font-size:16px;padding:14px;width:100%;outline:none;transition:border-color 0.2s;text-align:center;letter-spacing:1px}
.inp:focus{border-color:var(--acc)}.inp::placeholder{color:var(--tx3);font-family:'DM Sans';letter-spacing:0}
@keyframes flame{0%,100%{transform:scale(1) rotate(-2deg)}50%{transform:scale(1.12) rotate(2deg)}}.flame{animation:flame 1.5s ease-in-out infinite;display:inline-block}
@keyframes pop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}.pop{animation:pop 0.4s ease-out}
@keyframes slideUp{from{transform:translateY(80px);opacity:0}to{transform:translateY(0);opacity:1}}.slideUp{animation:slideUp 0.35s ease-out}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}.shake{animation:shake 0.4s ease}
.sess-bar{height:5px;background:var(--bg);border-radius:3px;overflow:hidden;margin-bottom:20px}
.sess-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--acc),var(--acc2));transition:width 0.4s}
.match-item{padding:10px 14px;background:var(--bg4);border:2px solid rgba(255,255,255,0.06);border-radius:var(--rs);font-size:13px;cursor:pointer;transition:all 0.15s;text-align:center;font-weight:500}
.match-item:hover:not(.done){border-color:var(--acc)}
.match-item.sel{border-color:var(--acc);background:rgba(0,229,255,0.08);color:var(--acc)}
.match-item.ok{border-color:var(--ok);background:rgba(0,230,118,0.08);color:var(--ok)}
.match-item.no{border-color:var(--bad);background:rgba(255,23,68,0.08);color:var(--bad)}
.match-item.done{opacity:0.4;cursor:default}
.ord-item{padding:12px 16px;background:var(--bg4);border:2px solid rgba(255,255,255,0.06);border-radius:var(--rs);font-size:14px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:10px;font-weight:500}
.ord-item:hover:not(.placed){border-color:var(--acc)}.ord-item.placed{opacity:0.3;cursor:default}
.ord-num{width:24px;height:24px;border-radius:50%;background:var(--acc);color:var(--bg);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:'Chakra Petch'}
.cat-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
.diff-star{font-size:10px}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:2px}`;

function renderQ(t){return t.replace(/\`([^\`]+)\`/g,'<code>$1</code>');}
function renderBlank(t){return renderQ(t).replace(/____+/g,'<span style="border-bottom:2px dashed var(--acc);padding:0 8px;color:var(--acc)">______</span>');}

function Pick1of4({q,onAnswer}){
  const[sel,setSel]=useState(null);const[rev,setRev]=useState(false);const st=useRef(Date.now());
  const sh=useMemo(()=>shuffle(q.options.map((_,i)=>i)).map(i=>({text:q.options[i],oi:i})),[q.id]);
  const pick=oi=>{if(rev)return;setSel(oi);setRev(true);setTimeout(()=>onAnswer(oi===q.answer,(Date.now()-st.current)/1000),900);};
  return(<div>
    <div style={{marginBottom:16,fontSize:16,lineHeight:1.6,fontWeight:500}} dangerouslySetInnerHTML={{__html:renderQ(q.q)}}/>
    {sh.map((o,i)=>{let c="opt";if(rev&&o.oi===q.answer)c+=" right";else if(rev&&o.oi===sel)c+=" wrong";else if(!rev&&sel===o.oi)c+=" sel";
      return<button key={i} className={c} disabled={rev} onClick={()=>pick(o.oi)}>
        <span style={{width:26,height:26,borderRadius:"50%",border:"2px solid currentColor",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontFamily:"'Chakra Petch'",fontWeight:700,flexShrink:0}}>{String.fromCharCode(65+i)}</span>
        <span dangerouslySetInnerHTML={{__html:renderQ(o.text)}}/>
      </button>;})}
  </div>);
}

function TrueFalse({q,onAnswer}){
  const[pk,setPk]=useState(null);const[rev,setRev]=useState(false);const st=useRef(Date.now());
  const h=v=>{if(rev)return;setPk(v);setRev(true);setTimeout(()=>onAnswer(v===q.answer,(Date.now()-st.current)/1000),1000);};
  return(<div>
    <div style={{marginBottom:20,fontSize:16,lineHeight:1.6,fontWeight:500}} dangerouslySetInnerHTML={{__html:renderQ(q.q)}}/>
    <div style={{display:"flex",gap:12}}>
      {[true,false].map(v=>{let c="opt";if(rev&&v===q.answer)c+=" right";else if(rev&&v===pk&&v!==q.answer)c+=" wrong";
        return<button key={String(v)} className={c} style={{flex:1,justifyContent:"center",fontFamily:"'Chakra Petch'",fontWeight:700,fontSize:16}} disabled={rev} onClick={()=>h(v)}>{v?"TRUE":"FALSE"}</button>;})}
    </div>
    {rev&&q.explanation&&<div className="slideUp" style={{marginTop:14,padding:14,background:"var(--bg4)",borderRadius:"var(--rs)",fontSize:13,color:"var(--tx2)",lineHeight:1.5,borderLeft:`3px solid ${pk===q.answer?"var(--ok)":"var(--bad)"}`}}>{q.explanation}</div>}
  </div>);
}

function FillBlank({q,onAnswer}){
  const[inp,setInp]=useState("");const[rev,setRev]=useState(false);const[ok,setOk]=useState(false);const st=useRef(Date.now());
  const sub=()=>{if(!inp.trim()||rev)return;const c=q.accept.some(a=>a.toLowerCase()===inp.trim().toLowerCase());setOk(c);setRev(true);setTimeout(()=>onAnswer(c,(Date.now()-st.current)/1000),900);};
  return(<div>
    <div style={{marginBottom:20,fontSize:16,lineHeight:1.6,fontWeight:500}} dangerouslySetInnerHTML={{__html:renderBlank(q.q)}}/>
    <input className="inp" style={{borderColor:rev?(ok?"var(--ok)":"var(--bad)"):undefined,fontSize:18}} value={inp} onChange={e=>setInp(e.target.value)} placeholder="Type your answer..." onKeyDown={e=>e.key==="Enter"&&sub()} disabled={rev} autoFocus/>
    {rev&&!ok&&<div className="slideUp" style={{marginTop:10,fontSize:14,color:"var(--ok)"}}>Correct answer: <code style={{color:"var(--ok)"}}>{q.answer}</code></div>}
    {!rev&&<button className="btn bp" style={{width:"100%",marginTop:12}} onClick={sub} disabled={!inp.trim()}>Check</button>}
  </div>);
}

function OrderQ({q,onAnswer}){
  const[pool,setPool]=useState([]);const[placed,setPlaced]=useState([]);const[rev,setRev]=useState(false);const st=useRef(Date.now());
  useEffect(()=>{setPool(shuffle(q.items.map((t,i)=>({text:t,oi:i}))));setPlaced([]);setRev(false);},[q.id]);
  const pick=it=>{if(rev)return;const np=[...placed,it];setPlaced(np);
    if(np.length===q.items.length){const ok=np.every((x,i)=>x.oi===q.correctOrder[i]);setRev(true);setTimeout(()=>onAnswer(ok,(Date.now()-st.current)/1000),900);}};
  const pids=new Set(placed.map(p=>p.oi));
  return(<div>
    <div style={{marginBottom:16,fontSize:16,lineHeight:1.6,fontWeight:500}} dangerouslySetInnerHTML={{__html:renderQ(q.q)}}/>
    {placed.length>0&&<div style={{marginBottom:14,display:"flex",flexDirection:"column",gap:6}}>
      {placed.map((it,i)=><div key={i} className="ord-item pop" style={{borderColor:rev?(it.oi===q.correctOrder[i]?"var(--ok)":"var(--bad)"):"var(--acc)",background:rev?(it.oi===q.correctOrder[i]?"rgba(0,230,118,0.08)":"rgba(255,23,68,0.08)"):"rgba(0,229,255,0.05)"}}>
        <span className="ord-num" style={{background:rev?(it.oi===q.correctOrder[i]?"var(--ok)":"var(--bad)"):"var(--acc)"}}>{i+1}</span>{it.text}</div>)}
    </div>}
    {!rev&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
      {pool.map((it,i)=><button key={i} className={`ord-item ${pids.has(it.oi)?"placed":""}`} disabled={pids.has(it.oi)} onClick={()=>pick(it)}>{it.text}</button>)}
    </div>}
    {!rev&&placed.length>0&&placed.length<q.items.length&&<button className="btn bs bsm" style={{marginTop:10}} onClick={()=>setPlaced([])}>Reset</button>}
    {rev&&!placed.every((it,i)=>it.oi===q.correctOrder[i])&&<div className="slideUp" style={{marginTop:10,fontSize:13,color:"var(--tx2)"}}>Correct: {q.items.join(" → ")}</div>}
  </div>);
}

function MatchQ({q,onAnswer}){
  const[ls,setLs]=useState(null);const[m,setM]=useState({});const[wp,setWp]=useState(null);const[rev,setRev]=useState(false);const[att,setAtt]=useState(0);const st=useRef(Date.now());
  const sr=useMemo(()=>shuffle(q.pairs.map((p,i)=>({text:p.r,oi:i}))),[q.id]);
  const ml=new Set(Object.keys(m).map(Number));const mr=new Set(Object.values(m).map(Number));
  const hr=roi=>{if(ls===null||rev)return;
    if(roi===ls){const nm={...m,[ls]:roi};setM(nm);setLs(null);if(Object.keys(nm).length===q.pairs.length){setRev(true);setTimeout(()=>onAnswer(true,(Date.now()-st.current)/1000),700);}}
    else{setAtt(a=>a+1);if(att>=q.pairs.length*2){setRev(true);setTimeout(()=>onAnswer(false,(Date.now()-st.current)/1000),700);return;}
      setWp({l:ls,r:roi});setTimeout(()=>{setWp(null);setLs(null);},600);}};
  return(<div>
    <div style={{marginBottom:16,fontSize:16,lineHeight:1.6,fontWeight:500}}>{q.q}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {q.pairs.map((p,i)=>{let c="match-item";if(ml.has(i))c+=" ok done";else if(ls===i)c+=" sel";else if(wp?.l===i)c+=" no";
          return<div key={i} className={c} onClick={()=>{if(!ml.has(i)&&!rev)setLs(i)}} dangerouslySetInnerHTML={{__html:renderQ(p.l)}}/>;})}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {sr.map((r,i)=>{let c="match-item";if(mr.has(r.oi))c+=" ok done";else if(wp?.r===r.oi)c+=" no";
          return<div key={i} className={c} onClick={()=>hr(r.oi)} dangerouslySetInnerHTML={{__html:renderQ(r.text)}}/>;})}
      </div>
    </div>
  </div>);
}

function Session({questions,category,onComplete,onQuit}){
  const[idx,setIdx]=useState(0);const[res,setRes]=useState([]);const[fb,setFb]=useState(null);const[hearts,setHearts]=useState(3);
  const cat=CATEGORIES[category];const q=questions[idx];
  const handle=(correct,timeSec)=>{
    const nr=[...res,{qid:q.id,correct,timeSec,diff:q.diff}];setRes(nr);
    if(!correct)setHearts(h=>h-1);
    setFb({correct,msg:correct?shuffle(["Correct!","Nailed it!","Right!","Nice one!","Exactly!"])[0]:"Not quite..."});
    setTimeout(()=>{setFb(null);if((hearts<=1&&!correct)||idx+1>=questions.length)onComplete(nr);else setIdx(idx+1);},correct?800:1200);};
  const prog=((idx+(fb?1:0))/questions.length)*100;
  return(<div style={{paddingTop:16}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
      <button className="btn bs bsm" onClick={onQuit} style={{padding:"6px 10px",fontSize:18}}>✕</button>
      <div className="sess-bar" style={{flex:1,margin:0}}><div className="sess-fill" style={{width:`${prog}%`}}/></div>
      <div style={{display:"flex",gap:2}}>{[...Array(3)].map((_,i)=><span key={i} style={{fontSize:18,opacity:i<hearts?1:0.2,transition:"opacity 0.3s"}}>{i<hearts?"❤️":"🖤"}</span>)}</div>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <span className="cat-pill" style={{background:cat.color+"22",color:cat.color}}>{cat.icon} {cat.name}</span>
      <span style={{fontSize:12,color:"var(--tx3)",fontFamily:"'Chakra Petch'"}}>
        {idx+1}/{questions.length}
        <span style={{marginLeft:8}}>{[...Array(q.diff)].map((_,i)=><span key={i} className="diff-star" style={{color:"var(--gold)"}}>★</span>)}{[...Array(3-q.diff)].map((_,i)=><span key={i} className="diff-star" style={{color:"var(--tx3)"}}>★</span>)}</span>
      </span>
    </div>
    <div className={`card glow ${fb&&!fb.correct?"shake":""}`} key={q.id}>
      {q.type==="pick1of4"&&<Pick1of4 q={q} onAnswer={handle}/>}
      {q.type==="truefalse"&&<TrueFalse q={q} onAnswer={handle}/>}
      {q.type==="fillblank"&&<FillBlank q={q} onAnswer={handle}/>}
      {q.type==="order"&&<OrderQ q={q} onAnswer={handle}/>}
      {q.type==="match"&&<MatchQ q={q} onAnswer={handle}/>}
    </div>
    {fb&&<div className="pop" style={{textAlign:"center",padding:12}}>
      <span style={{fontSize:28,marginRight:8}}>{fb.correct?"✅":"❌"}</span>
      <span style={{fontFamily:"'Chakra Petch'",fontWeight:700,fontSize:18,color:fb.correct?"var(--ok)":"var(--bad)"}}>{fb.msg}</span>
    </div>}
  </div>);
}

function Summary({results,category,xpEarned,onDone}){
  const cc=results.filter(r=>r.correct).length;const t=results.length;const pct=Math.round((cc/t)*100);const cat=CATEGORIES[category];
  return(<div style={{paddingTop:40,textAlign:"center"}}>
    <div className="pop" style={{fontSize:64,marginBottom:12}}>{cc===t?"🎉":pct>=70?"💪":pct>=40?"📖":"😤"}</div>
    <h2 style={{fontSize:26,marginBottom:4}}>{cc===t?"Perfect!":pct>=70?"Great job!":pct>=40?"Keep going!":"Don't give up!"}</h2>
    <p style={{color:"var(--tx2)",marginBottom:24}}>{cat.icon} {cat.name} session complete</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:24}}>
      {[{l:"Correct",v:cc,c:"var(--ok)"},{l:"Missed",v:t-cc,c:"var(--bad)"},{l:"Score",v:pct+"%",c:"var(--gold)"}].map(s=>(
        <div key={s.l} className="card" style={{padding:14,textAlign:"center"}}>
          <div style={{fontFamily:"'Chakra Petch'",fontSize:28,fontWeight:700,color:s.c}}>{s.v}</div>
          <div style={{fontSize:11,color:"var(--tx3)"}}>{s.l}</div>
        </div>))}
    </div>
    <div className="card glow" style={{marginBottom:24}}>
      <div style={{fontFamily:"'Chakra Petch'",fontSize:18,color:"var(--gold)",fontWeight:700}}>+{xpEarned} XP{cc===t&&<span style={{marginLeft:8,color:"var(--acc)"}}>+30 perfect bonus!</span>}</div>
    </div>
    <button className="btn bp" style={{width:"100%",fontSize:16,padding:"14px 24px"}} onClick={onDone}>Continue</button>
  </div>);
}

function Dashboard({state,onStart}){
  const rank=getRank(state.level);const xpIn=state.xp%XP_PER_LEVEL;const recent=state.history.slice(-5).reverse();
  return(<div style={{paddingTop:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div><h1 style={{fontSize:30,background:"linear-gradient(135deg,var(--acc),var(--acc2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>JavaDrill</h1>
        <div style={{fontSize:11,color:"var(--tx3)",marginTop:1}}>Interview prep, gamified</div></div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span className={state.streak>0?"flame":""} style={{fontSize:26}}>{state.streak>0?"🔥":"❄️"}</span>
        <div><div style={{fontFamily:"'Chakra Petch'",fontWeight:700,fontSize:20,color:state.streak>0?"var(--fire)":"var(--tx3)"}}>{state.streak}</div>
          <div style={{fontSize:10,color:"var(--tx3)",marginTop:-2}}>day streak</div></div>
      </div>
    </div>
    <div className="card glow" style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{rank.b}</span>
          <span style={{fontFamily:"'Chakra Petch'",fontWeight:700,fontSize:14,color:"var(--acc)"}}>{rank.name}</span></div>
        <span style={{fontSize:13,color:"var(--gold)",fontWeight:700}}>{state.xp} XP</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:13,fontFamily:"'Chakra Petch'",color:"var(--acc)",fontWeight:700}}>LV {state.level}</span>
        <div className="bar-bg" style={{flex:1}}><div className="bar-fill" style={{width:`${(xpIn/XP_PER_LEVEL)*100}%`,background:"linear-gradient(90deg,var(--acc),var(--acc2))"}}/></div>
        <span style={{fontSize:12,color:"var(--tx3)"}}>{xpIn}/{XP_PER_LEVEL}</span>
      </div>
    </div>
    <div className="card">
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:13,color:"var(--tx2)"}}>Daily Goal</span>
        <span style={{fontSize:13,fontWeight:700,color:state.dailyToday>=DAILY_GOAL?"var(--ok)":"var(--tx)"}}>{Math.min(state.dailyToday,DAILY_GOAL)}/{DAILY_GOAL}{state.dailyToday>=DAILY_GOAL&&" ✓"}</span>
      </div>
      <div className="bar-bg" style={{height:6}}><div className="bar-fill" style={{width:`${Math.min((state.dailyToday/DAILY_GOAL)*100,100)}%`,background:state.dailyToday>=DAILY_GOAL?"var(--ok)":"var(--fire)"}}/></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,margin:"10px 0"}}>
      {[{l:"Answered",v:state.total,c:"var(--acc)"},{l:"Correct",v:state.correct,c:"var(--ok)"},{l:"Sessions",v:state.sessionsCompleted,c:"var(--acc2)"}].map(s=>(
        <div key={s.l} className="card" style={{textAlign:"center",padding:14}}>
          <div style={{fontFamily:"'Chakra Petch'",fontWeight:700,fontSize:22,color:s.c}}>{s.v}</div>
          <div style={{fontSize:11,color:"var(--tx3)"}}>{s.l}</div>
        </div>))}
    </div>
    <button className="btn bp" onClick={onStart} style={{width:"100%",fontSize:18,padding:"16px 24px",background:"linear-gradient(135deg,var(--acc),var(--acc2))",marginBottom:14}}>🎯 Start Practice</button>
    {recent.length>0&&<div><h4 style={{fontSize:13,color:"var(--tx3)",marginBottom:8}}>Recent Sessions</h4>
      {recent.map((h,i)=>{const c=CATEGORIES[h.cat];return(
        <div key={i} className="card" style={{padding:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13}}>{c?.icon} {c?.name}</span>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <span style={{fontSize:13,color:h.correct===h.total?"var(--ok)":"var(--tx2)"}}>{h.correct}/{h.total}</span>
            <span style={{fontSize:12,color:"var(--gold)",fontWeight:700}}>+{h.xp}</span>
          </div>
        </div>);})}</div>}
  </div>);
}

function CatView({state,onPick}){
  return(<div style={{paddingTop:20}}>
    <h2 style={{fontSize:22,marginBottom:4}}>Choose a Topic</h2>
    <p style={{fontSize:13,color:"var(--tx3)",marginBottom:16}}>Each session is {SESSION_SIZE} questions</p>
    {Object.entries(CATEGORIES).map(([k,cat])=>{
      const p=state.catProg[k]||{ans:0,cor:0};const tq=Q.filter(q=>q.cat===k).length;const pct=p.ans>0?Math.round((p.cor/p.ans)*100):0;
      return(<div key={k} className="card" onClick={()=>onPick(k)}
        style={{cursor:"pointer",borderLeft:`3px solid ${cat.color}`,transition:"all 0.15s"}}
        onMouseOver={e=>{e.currentTarget.style.transform="translateX(4px)";e.currentTarget.style.borderColor=cat.color}}
        onMouseOut={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor="rgba(255,255,255,0.04)";e.currentTarget.style.borderLeftColor=cat.color}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:28}}>{cat.icon}</span>
            <div><div style={{fontFamily:"'Chakra Petch'",fontWeight:700,fontSize:15}}>{cat.name}</div>
              <div style={{fontSize:12,color:"var(--tx3)"}}>{cat.desc}</div></div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:12,color:"var(--tx3)"}}>{tq} Qs</div>
            {p.ans>0&&<div style={{fontSize:12,color:pct>=70?"var(--ok)":"var(--fire)"}}>{pct}%</div>}</div>
        </div>
      </div>);})}
  </div>);
}

function ProgressView({state}){
  const acc=state.total>0?Math.round((state.correct/state.total)*100):0;
  return(<div style={{paddingTop:20}}>
    <h2 style={{fontSize:22,marginBottom:16}}>Progress</h2>
    <div className="card glow" style={{textAlign:"center",marginBottom:14}}>
      <div style={{fontSize:14,color:"var(--tx3)",marginBottom:4}}>Overall Accuracy</div>
      <div style={{fontFamily:"'Chakra Petch'",fontSize:40,fontWeight:700,color:acc>=70?"var(--ok)":acc>=40?"var(--warn)":"var(--bad)"}}>{acc}%</div>
      <div style={{fontSize:13,color:"var(--tx2)",marginTop:4}}>{state.correct} correct out of {state.total}</div>
    </div>
    {Object.entries(CATEGORIES).map(([k,cat])=>{
      const p=state.catProg[k]||{ans:0,cor:0};const tq=Q.filter(q=>q.cat===k).length;const pct=p.ans>0?Math.round((p.cor/p.ans)*100):0;
      return(<div key={k} className="card" style={{padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:14,fontWeight:600}}>{cat.icon} {cat.name}</span>
          <span style={{fontSize:12,color:"var(--tx3)"}}>{p.ans} answered</span>
        </div>
        <div className="bar-bg" style={{height:5}}><div className="bar-fill" style={{width:`${Math.min((p.ans/tq)*100,100)}%`,background:cat.color}}/></div>
        {p.ans>0&&<div style={{fontSize:11,color:"var(--tx3)",marginTop:4}}>Accuracy: {pct}%</div>}
      </div>);})}
  </div>);
}

function BadgesView({state}){
  return(<div style={{paddingTop:20}}>
    <h2 style={{fontSize:22,marginBottom:4}}>Achievements</h2>
    <p style={{fontSize:13,color:"var(--tx3)",marginBottom:16}}>{state.badges.length}/{ACHIEVEMENTS.length} unlocked</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {ACHIEVEMENTS.map(a=>{const got=state.badges.includes(a.id);return(
        <div key={a.id} className={`card ${got?"pop":""}`} style={{padding:14,textAlign:"center",opacity:got?1:0.3,borderColor:got?"var(--gold)":undefined}}>
          <div style={{fontSize:30,marginBottom:4}}>{a.icon}</div>
          <div style={{fontFamily:"'Chakra Petch'",fontWeight:700,fontSize:12}}>{a.name}</div>
          <div style={{fontSize:11,color:"var(--tx3)",marginTop:2}}>{a.desc}</div>
        </div>);})}
    </div>
  </div>);
}

function ProfileView({state,dispatch}){
  const[editing,setEditing]=useState(false);const[name,setName]=useState(state.displayName);
  const rank=getRank(state.level);const acc=state.total>0?Math.round((state.correct/state.total)*100):0;
  const save=()=>{dispatch({type:"SET_NAME",p:name.trim()||"Java Developer"});setEditing(false);};
  return(<div style={{paddingTop:20}}>
    <h2 style={{fontSize:22,marginBottom:16}}>Profile</h2>
    <div className="card glow" style={{textAlign:"center",padding:28}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,var(--acc),var(--acc2))",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:36}}>{rank.b}</div>
      {editing?(<div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:8}}>
        <input className="inp" style={{maxWidth:200,textAlign:"center",fontSize:16,padding:8}} value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()} autoFocus/>
        <button className="btn bp bsm" onClick={save}>Save</button></div>
      ):(<div style={{cursor:"pointer"}} onClick={()=>setEditing(true)}>
        <h3 style={{fontSize:20,marginBottom:2}}>{state.displayName}</h3>
        <div style={{fontSize:11,color:"var(--tx3)"}}>tap to edit name</div></div>)}
      <div style={{fontFamily:"'Chakra Petch'",fontWeight:700,fontSize:14,color:"var(--acc)",marginTop:8}}>{rank.b} {rank.name} — Level {state.level}</div>
      <div style={{fontSize:12,color:"var(--tx3)",marginTop:4}}>Joined {state.joinDate}</div>
    </div>
    <h4 style={{fontSize:14,color:"var(--tx3)",margin:"16px 0 10px"}}>Lifetime Stats</h4>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {[{l:"Total XP",v:state.xp,c:"var(--gold)",i:"⚡"},{l:"Questions",v:state.total,c:"var(--acc)",i:"📝"},{l:"Accuracy",v:acc+"%",c:acc>=70?"var(--ok)":"var(--warn)",i:"🎯"},{l:"Best Streak",v:state.streak+" days",c:"var(--fire)",i:"🔥"},{l:"Perfect Runs",v:state.perfectSessions,c:"var(--gold)",i:"💎"},{l:"Categories",v:Object.keys(state.catProg).length+"/"+Object.keys(CATEGORIES).length,c:"var(--acc2)",i:"🌐"},{l:"Sessions",v:state.sessionsCompleted,c:"var(--acc)",i:"🎮"},{l:"Achievements",v:state.badges.length+"/"+ACHIEVEMENTS.length,c:"var(--gold)",i:"🏆"}].map(s=>(
        <div key={s.l} className="card" style={{padding:14,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>{s.i}</span>
          <div><div style={{fontFamily:"'Chakra Petch'",fontWeight:700,fontSize:18,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:"var(--tx3)"}}>{s.l}</div></div>
        </div>))}
    </div>
  </div>);
}

export default function App(){
  const[state,dispatch]=useReducer(reducer,INIT);const[view,setView]=useState("home");
  const[sq,setSq]=useState([]);const[sc,setSc]=useState(null);const[sr,setSr]=useState(null);const[sxp,setSxp]=useState(0);
  const[toast,setToast]=useState(null);const[loaded,setLoaded]=useState(false);const pb=useRef([]);

  useEffect(()=>{try{const r=localStorage.getItem("javadrill-v2");if(r)dispatch({type:"LOAD",p:JSON.parse(r)});}catch(e){}setLoaded(true);},[]);
  useEffect(()=>{if(!loaded)return;try{localStorage.setItem("javadrill-v2",JSON.stringify(state));}catch(e){}},[state,loaded]);
  useEffect(()=>{if(loaded)dispatch({type:"CHECK_DAY"});},[loaded,view]);
  useEffect(()=>{const nb=state.badges.find(b=>!pb.current.includes(b));if(nb){const a=ACHIEVEMENTS.find(x=>x.id===nb);if(a){setToast(a);setTimeout(()=>setToast(null),3500);}}pb.current=state.badges;},[state.badges]);

  const startSession=cat=>{const pool=Q.filter(q=>q.cat===cat);setSq(shuffle(pool).slice(0,Math.min(SESSION_SIZE,pool.length)));setSc(cat);setView("session");};
  const finishSession=results=>{const cc=results.filter(r=>r.correct).length;const db=results.reduce((a,r)=>a+(r.correct?r.diff*5:0),0);
    const xp=cc*15+db+(cc===results.length?30:0);setSxp(xp);setSr(results);dispatch({type:"SESSION_COMPLETE",p:{results,category:sc}});setView("summary");};

  if(!loaded)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"var(--bg)"}}><style>{CSS}</style>
    <div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>☕</div><div style={{fontFamily:"'Chakra Petch'",fontSize:20,color:"var(--acc)"}}>Loading JavaDrill...</div></div></div>);

  return(<><style>{CSS}</style><div className="app">
    {view==="home"&&<Dashboard state={state} onStart={()=>setView("categories")}/>}
    {view==="categories"&&<CatView state={state} onPick={startSession}/>}
    {view==="session"&&<Session questions={sq} category={sc} onComplete={finishSession} onQuit={()=>setView("home")}/>}
    {view==="summary"&&<Summary results={sr} category={sc} xpEarned={sxp} onDone={()=>setView("home")}/>}
    {view==="progress"&&<ProgressView state={state}/>}
    {view==="badges"&&<BadgesView state={state}/>}
    {view==="profile"&&<ProfileView state={state} dispatch={dispatch}/>}

    {!["session","summary"].includes(view)&&<div className="nav">
      {[{id:"home",icon:"🏠",label:"Home"},{id:"categories",icon:"📝",label:"Practice"},{id:"progress",icon:"📊",label:"Progress"},{id:"badges",icon:"🏆",label:"Badges"},{id:"profile",icon:"👤",label:"Profile"}].map(t=>(
        <button key={t.id} className={`nb ${view===t.id?"on":""}`} onClick={()=>setView(t.id)}><span className="ni">{t.icon}</span>{t.label}</button>))}
    </div>}

    {toast&&<div className="slideUp" style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",zIndex:200,background:"var(--bg4)",border:"1px solid var(--gold)",borderRadius:"var(--r)",padding:"14px 22px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 8px 32px rgba(0,0,0,0.6)"}}>
      <span style={{fontSize:30}}>{toast.icon}</span>
      <div><div style={{fontFamily:"'Chakra Petch'",fontWeight:700,color:"var(--gold)",fontSize:13}}>Achievement Unlocked!</div>
        <div style={{fontSize:13,color:"var(--tx)"}}>{toast.name}</div></div>
    </div>}
  </div></>);
}
