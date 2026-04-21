import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight, BookOpen } from "lucide-react";

// ─── Question bank keyed by step title ───────────────────────────────────────
// 10 questions per step. Answer index is 0-based.
type Q = { q: string; options: string[]; answer: number };

const QUESTION_BANK: Record<string, Q[]> = {
  // ── Web Dev ───────────────────────────────────────────────────────────────
  "HTML & CSS Mastery": [
    { q: "Which CSS property is used to create a responsive grid layout?", options: ["display: flex", "display: grid", "display: block", "display: inline"], answer: 1 },
    { q: "What does the 'box-model' in CSS consist of?", options: ["Margin, Border, Padding, Content", "Width, Height, Color", "Flexbox, Grid, Position", "Inline, Block, Float"], answer: 0 },
    { q: "Which HTML5 element is used for navigation links?", options: ["<nav>", "<menu>", "<links>", "<header>"], answer: 0 },
    { q: "What is the correct CSS to center a div horizontally with flexbox?", options: ["align-items: center", "justify-content: center", "text-align: center", "margin: auto"], answer: 1 },
    { q: "What does 'em' unit in CSS refer to?", options: ["The root element's font size", "The current element's font size", "Pixels", "Viewport width"], answer: 1 },
    { q: "Which attribute makes an HTML input field mandatory?", options: ["mandatory", "required", "validate", "must"], answer: 1 },
    { q: "What is the CSS specificity order (highest to lowest)?", options: ["ID → Class → Element", "Class → ID → Element", "Element → Class → ID", "ID → Element → Class"], answer: 0 },
    { q: "Which CSS property controls the stacking order of elements?", options: ["stack-order", "z-index", "layer", "order"], answer: 1 },
    { q: "What is the purpose of the 'viewport' meta tag?", options: ["Set background color", "Control layout on mobile", "Define page title", "Load fonts"], answer: 1 },
    { q: "Which CSS value creates a smooth transition between two colors as background?", options: ["transition", "animation", "linear-gradient", "background-blend"], answer: 2 },
  ],
  "JavaScript Fundamentals": [
    { q: "What does 'typeof null' return in JavaScript?", options: ["'null'", "'undefined'", "'object'", "'boolean'"], answer: 2 },
    { q: "Which method removes the last element from an array and returns it?", options: ["shift()", "pop()", "splice()", "slice()"], answer: 1 },
    { q: "What is a closure in JavaScript?", options: ["A function with no parameters", "A function that remembers its outer scope", "A self-invoking function", "An arrow function"], answer: 1 },
    { q: "What is the output of: console.log(0.1 + 0.2 === 0.3)?", options: ["true", "false", "undefined", "NaN"], answer: 1 },
    { q: "Which keyword is used for variable declaration with block scope?", options: ["var", "let", "both", "function"], answer: 1 },
    { q: "What does the spread operator (...) do?", options: ["Multiplies arrays", "Expands iterables into individual elements", "Creates a new scope", "Defines rest parameters only"], answer: 1 },
    { q: "How do you handle errors in async/await functions?", options: ["try/catch", ".catch()", "error handler", "both try/catch and .catch()"], answer: 3 },
    { q: "What is event delegation?", options: ["Removing event listeners", "Adding a listener to a parent to handle child events", "Preventing default behavior", "Creating custom events"], answer: 1 },
    { q: "What does Array.prototype.reduce() do?", options: ["Filters array elements", "Reduces array to single value by accumulation", "Maps each element", "Sorts the array"], answer: 1 },
    { q: "What is the difference between == and === in JavaScript?", options: ["No difference", "=== also checks type", "== is faster", "=== only works with numbers"], answer: 1 },
  ],
  "React Core Concepts": [
    { q: "What is the purpose of React's useEffect hook?", options: ["Manage state", "Handle side effects", "Create context", "Optimize renders"], answer: 1 },
    { q: "What does the key prop do in a React list?", options: ["Sets styling", "Helps React identify changed elements", "Passes data to children", "Triggers re-render"], answer: 1 },
    { q: "When does React re-render a component?", options: ["On every function call", "When state or props change", "Once on mount", "Only on user events"], answer: 1 },
    { q: "What is the correct way to update state in React?", options: ["Directly mutate state", "Use setState or the setter from useState", "Use a global variable", "Call render() manually"], answer: 1 },
    { q: "What is props drilling?", options: ["Creating prop types", "Passing props through many nested components", "Drilling into component internals", "Using spread on props"], answer: 1 },
    { q: "What does React.memo() do?", options: ["Memoizes expensive calculations", "Prevents re-render if props unchanged", "Creates a memo note", "Caches API calls"], answer: 1 },
    { q: "Which hook would you use for expensive calculations?", options: ["useEffect", "useCallback", "useMemo", "useRef"], answer: 2 },
    { q: "What is the virtual DOM?", options: ["A browser feature", "A JS object representing the real DOM", "CSS in JS", "A testing tool"], answer: 1 },
    { q: "What does useContext hook do?", options: ["Creates context", "Consumes a context value without prop drilling", "Provides context", "Manages global state"], answer: 1 },
    { q: "What is the correct lifecycle order in a React functional component?", options: ["Render → useEffect → Cleanup", "useEffect → Render → Cleanup", "Cleanup → Render → useEffect", "Render → Cleanup → useEffect"], answer: 0 },
  ],
  "Backend with Node.js": [
    { q: "What is middleware in Express.js?", options: ["A database layer", "Functions that have access to req, res, and next", "Frontend templates", "Error pages"], answer: 1 },
    { q: "Which HTTP status code means 'Resource Created'?", options: ["200 OK", "201 Created", "204 No Content", "301 Redirect"], answer: 1 },
    { q: "What does res.json() do in Express?", options: ["Reads JSON from request", "Sends JSON response and sets Content-Type", "Parses middleware", "Creates route"], answer: 1 },
    { q: "What is the purpose of express.Router()?", options: ["Create a database connection", "Create modular, mountable route handlers", "Handle errors", "Serve static files"], answer: 1 },
    { q: "What is the Event Loop in Node.js?", options: ["A for loop", "Mechanism handling async I/O operations", "Module loader", "HTTP handler"], answer: 1 },
    { q: "Which built-in module handles file system in Node.js?", options: ["path", "http", "fs", "os"], answer: 2 },
    { q: "What does next() do in Express middleware?", options: ["Ends the request", "Passes control to the next middleware", "Redirects", "Throws an error"], answer: 1 },
    { q: "What is the purpose of environment variables (.env)?", options: ["Store styles", "Store sensitive config outside source code", "Cache data", "Define routes"], answer: 1 },
    { q: "Which method handles GET requests in Express?", options: ["app.get()", "app.post()", "app.put()", "app.use()"], answer: 0 },
    { q: "What is REST architecture?", options: ["A database type", "Stateless client-server communication via HTTP", "Frontend framework", "A query language"], answer: 1 },
  ],
  "Database Design": [
    { q: "What is a primary key in a relational database?", options: ["Any column", "Uniquely identifies each row", "Foreign key reference", "Index column"], answer: 1 },
    { q: "What does CRUD stand for?", options: ["Create, Read, Update, Delete", "Connect, Retrieve, Upload, Drop", "Clone, Run, Update, Deploy", "None of the above"], answer: 0 },
    { q: "What is a foreign key?", options: ["Encrypted key", "Column linking to primary key of another table", "Unique identifier", "Index on a table"], answer: 1 },
    { q: "What is database normalization?", options: ["Speeding up queries", "Organizing data to reduce redundancy", "Backing up data", "Encrypting data"], answer: 1 },
    { q: "What does SQL JOIN do?", options: ["Merges two databases", "Combines rows from multiple tables", "Creates a table", "Deletes duplicates"], answer: 1 },
    { q: "What is the difference between SQL and NoSQL?", options: ["No difference", "SQL uses structured tables; NoSQL is flexible (documents, etc.)", "NoSQL is faster always", "SQL can't scale"], answer: 1 },
    { q: "What is an index in a database?", options: ["Data backup", "Structure improving query speed", "Table constraint", "Primary key"], answer: 1 },
    { q: "What does MongoDB store data as?", options: ["Tables", "BSON documents", "XML files", "Binary blobs"], answer: 1 },
    { q: "What is a transaction in a database?", options: ["A query", "Sequence of operations treated as a single unit", "A stored procedure", "An index"], answer: 1 },
    { q: "What SQL clause filters results after grouping?", options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], answer: 1 },
  ],
  "Authentication & Security": [
    { q: "What does JWT stand for?", options: ["Java Web Token", "JSON Web Token", "JavaScript Web Transfer", "JSON Web Transfer"], answer: 1 },
    { q: "What is bcrypt used for?", options: ["Encrypting network traffic", "Hashing passwords", "Signing tokens", "Validating emails"], answer: 1 },
    { q: "What is XSS (Cross-Site Scripting)?", options: ["SQL injection", "Injecting malicious scripts into web pages", "CSRF attack", "DDoS attack"], answer: 1 },
    { q: "What does HTTPS provide over HTTP?", options: ["Faster speed", "Encryption via TLS/SSL", "Caching", "Compression"], answer: 1 },
    { q: "What is the purpose of a refresh token?", options: ["Reset password", "Obtain new access tokens without re-login", "Validate email", "Sign requests"], answer: 1 },
    { q: "What is CORS?", options: ["A CSS property", "Mechanism controlling cross-origin requests", "A database", "An API standard"], answer: 1 },
    { q: "What is OAuth 2.0 used for?", options: ["Password hashing", "Authorization framework allowing third-party access", "Encryption", "Session management"], answer: 1 },
    { q: "Which HTTP header is used to send a JWT?", options: ["X-Auth-Token", "Authorization: Bearer", "Cookie: token", "X-JWT"], answer: 1 },
    { q: "What is SQL injection?", options: ["Valid SQL usage", "Inserting malicious SQL through input", "Database optimization", "Query caching"], answer: 1 },
    { q: "What does 'salting' a password mean?", options: ["Encrypting twice", "Adding random data before hashing", "Using pepper", "Storing in plaintext"], answer: 1 },
  ],
  "Full-Stack Project": [
    { q: "What is a monorepo?", options: ["One database", "Single repository holding multiple projects", "Microservice", "API gateway"], answer: 1 },
    { q: "What does CI/CD stand for?", options: ["Continuous Integration/Delivery", "Code Inspection/Deployment", "Cloud Infrastructure/Design", "None"], answer: 0 },
    { q: "What is the purpose of a .env file in a project?", options: ["Store passwords in code", "Store environment-specific config outside source control", "Define routes", "Cache translations"], answer: 1 },
    { q: "What is a CDN?", options: ["Database", "Network delivering content from servers near the user", "CSS library", "Code repository"], answer: 1 },
    { q: "What is the difference between authentication and authorization?", options: ["Same thing", "Auth = who you are; Authz = what you can do", "Authorization happens first", "Authentication is optional"], answer: 1 },
    { q: "What is a RESTful API?", options: ["A database protocol", "Stateless HTTP API following REST principles", "A frontend library", "GraphQL variant"], answer: 1 },
    { q: "What tool is commonly used for API testing?", options: ["Figma", "Postman", "Webpack", "Jest"], answer: 1 },
    { q: "What does Docker containerize?", options: ["Databases only", "Applications and dependencies in isolated environments", "Frontend only", "APIs only"], answer: 1 },
    { q: "What is the purpose of Git branches?", options: ["Speed up builds", "Isolate work without affecting main codebase", "Backup code", "Merge conflicts"], answer: 1 },
    { q: "What is Vercel used for?", options: ["Database hosting", "Deploying frontend/full-stack apps easily", "Container orchestration", "Code review"], answer: 1 },
  ],

  // ── AI/ML ─────────────────────────────────────────────────────────────────
  "Python for Data Science": [
    { q: "Which library is used for numerical computing in Python?", options: ["Pandas", "NumPy", "Matplotlib", "SciPy"], answer: 1 },
    { q: "What does df.dropna() do in Pandas?", options: ["Drops duplicates", "Removes rows with missing values", "Fills NaN values", "Sorts rows"], answer: 1 },
    { q: "Which NumPy function shapes a flat array into 2D?", options: ["np.flatten()", "np.reshape()", "np.squeeze()", "np.expand_dims()"], answer: 1 },
    { q: "What does plt.show() do in Matplotlib?", options: ["Saves figure", "Displays the plot", "Clears figure", "Creates new axes"], answer: 1 },
    { q: "How do you select column 'age' from a DataFrame df?", options: ["df.age()", "df['age']", "df.get('age')", "df.select('age')"], answer: 1 },
    { q: "What is a Jupyter Notebook used for?", options: ["Web hosting", "Interactive code execution with documentation", "Database GUI", "Container runtime"], answer: 1 },
    { q: "Which Pandas method shows basic stats of numeric columns?", options: ["df.info()", "df.describe()", "df.stats()", "df.summary()"], answer: 1 },
    { q: "What does broadcasting mean in NumPy?", options: ["Streaming data", "Operations on arrays of different shapes", "Printing arrays", "Copying arrays"], answer: 1 },
    { q: "How do you filter a DataFrame for rows where age > 30?", options: ["df.filter(age > 30)", "df[df['age'] > 30]", "df.where('age > 30')", "df.query(age > 30)"], answer: 1 },
    { q: "What is the purpose of df.groupby('category').sum()?", options: ["Sort by category", "Group rows by category and sum values", "Filter categories", "Count categories"], answer: 1 },
  ],
  "Machine Learning Basics": [
    { q: "What is the difference between supervised and unsupervised learning?", options: ["No difference", "Supervised uses labeled data; unsupervised finds patterns without labels", "Unsupervised needs more data", "Supervised requires GPUs"], answer: 1 },
    { q: "What does overfitting mean?", options: ["Model trains too slowly", "Model performs well on training but poorly on new data", "Model underfits data", "Model has low complexity"], answer: 1 },
    { q: "What is cross-validation?", options: ["Validating API endpoints", "Technique to estimate model performance on unseen data", "Comparing two models", "Testing front-end"], answer: 1 },
    { q: "What is the purpose of a train/test split?", options: ["Speed up training", "Evaluate model on unseen data", "Reduce dataset size", "Add noise"], answer: 1 },
    { q: "Which metric is best for imbalanced classification?", options: ["Accuracy", "F1 Score", "Mean Squared Error", "R-squared"], answer: 1 },
    { q: "What is regularization?", options: ["Normalizing data", "Technique to prevent overfitting by penalizing complexity", "Speeding up training", "Data augmentation"], answer: 1 },
    { q: "What does a confusion matrix show?", options: ["Model training time", "True/false positives and negatives", "Feature importance", "Loss curves"], answer: 1 },
    { q: "What is gradient descent?", options: ["A data preprocessing step", "Optimization algorithm minimizing loss function", "A neural network layer", "A regularization method"], answer: 1 },
    { q: "What is the purpose of feature scaling?", options: ["Add more features", "Bring features to similar ranges for better convergence", "Remove outliers", "Encode categories"], answer: 1 },
    { q: "What is K-Nearest Neighbors (KNN)?", options: ["Clustering algorithm", "Classification based on K closest training examples", "Ensemble method", "Neural network type"], answer: 1 },
  ],

  // ── Mobile ────────────────────────────────────────────────────────────────
  "React Native Fundamentals": [
    { q: "What is the main difference between View and ScrollView in React Native?", options: ["No difference", "ScrollView allows scrolling; View doesn't", "View is for web", "ScrollView is deprecated"], answer: 1 },
    { q: "Which component renders a large scrollable list efficiently?", options: ["ScrollView", "FlatList", "ListView", "View"], answer: 1 },
    { q: "What is the Expo Go app used for?", options: ["Publishing apps", "Testing React Native apps without building", "App analytics", "Push notifications only"], answer: 1 },
    { q: "How do you style components in React Native?", options: ["CSS files", "StyleSheet.create() or inline style objects", "Tailwind classes", "classNames"], answer: 1 },
    { q: "What does React Navigation provide?", options: ["State management", "Navigation between screens", "API integration", "Animations only"], answer: 1 },
    { q: "What is the equivalent of div in React Native?", options: ["Container", "View", "Box", "Section"], answer: 1 },
    { q: "How do you handle device back button on Android?", options: ["BackHandler API", "onPress event", "window.history.back()", "useEffect cleanup"], answer: 0 },
    { q: "What platform does React Native target?", options: ["iOS only", "Android only", "Both iOS and Android", "Web only"], answer: 2 },
    { q: "What hook manages component state in React Native?", options: ["useNativeState", "useState", "useLocalState", "useRNState"], answer: 1 },
    { q: "What is Metro in React Native?", options: ["A navigation library", "JavaScript bundler for React Native", "A UI component", "A testing tool"], answer: 1 },
  ],

  // ── DevOps ────────────────────────────────────────────────────────────────
  "Containerization with Docker": [
    { q: "What is a Docker image?", options: ["A running container", "Read-only template used to create containers", "A registry", "A Dockerfile"], answer: 1 },
    { q: "What does 'docker-compose up' do?", options: ["Builds image only", "Starts all services defined in docker-compose.yml", "Stops containers", "Pulls images"], answer: 1 },
    { q: "What is a Dockerfile?", options: ["Docker configuration for networking", "Text file with instructions to build a Docker image", "Container runtime config", "Registry settings"], answer: 1 },
    { q: "What does the EXPOSE instruction in a Dockerfile do?", options: ["Opens firewall ports", "Documents which port the container listens on", "Maps ports to host", "Runs a command"], answer: 1 },
    { q: "What is the difference between CMD and ENTRYPOINT?", options: ["No difference", "ENTRYPOINT can't be overridden; CMD provides defaults that can be", "CMD is required; ENTRYPOINT optional", "ENTRYPOINT runs before build"], answer: 1 },
    { q: "What does 'docker ps' show?", options: ["All images", "Running containers", "System info", "Networks"], answer: 1 },
    { q: "What is a Docker volume?", options: ["Image size", "Persistent storage not tied to container lifecycle", "Container network", "Image layer"], answer: 1 },
    { q: "What does multi-stage builds solve?", options: ["Networking issues", "Reduces final image size by separating build and runtime", "Speeds up runtime", "Manages secrets"], answer: 1 },
    { q: "What is Docker Hub?", options: ["Docker CLI tool", "Public registry for Docker images", "Container orchestrator", "Docker compose UI"], answer: 1 },
    { q: "What command removes a stopped container?", options: ["docker stop", "docker kill", "docker rm", "docker rmi"], answer: 2 },
  ],
  "Kubernetes Orchestration": [
    { q: "What is a Pod in Kubernetes?", options: ["A node type", "Smallest deployable unit, containing one or more containers", "A service", "A namespace"], answer: 1 },
    { q: "What is a Kubernetes Service used for?", options: ["Storing data", "Exposing pods over a network", "Scaling pods", "Creating namespaces"], answer: 1 },
    { q: "What does kubectl apply -f do?", options: ["Delete resources", "Apply/create resources from a YAML file", "List pods", "Get logs"], answer: 1 },
    { q: "What is a Deployment in Kubernetes?", options: ["A build process", "Resource managing a ReplicaSet and pod updates", "Container image", "A namespace"], answer: 1 },
    { q: "What is the purpose of a Helm chart?", options: ["Container networking", "Package manager for Kubernetes applications", "Monitoring tool", "Service mesh"], answer: 1 },
    { q: "What does a ConfigMap store?", options: ["Secrets", "Non-sensitive configuration data as key-value pairs", "Container images", "Pod logs"], answer: 1 },
    { q: "What is horizontal pod autoscaling?", options: ["Increasing CPU", "Automatically adjusting pod count based on metrics", "Vertical scaling", "Node management"], answer: 1 },
    { q: "What is a Namespace in Kubernetes?", options: ["Container name", "Virtual cluster isolating resources within a cluster", "Node pool", "Ingress rule"], answer: 1 },
    { q: "Which Kubernetes resource manages stateful applications?", options: ["Deployment", "StatefulSet", "DaemonSet", "ReplicaSet"], answer: 1 },
    { q: "What does an Ingress resource do?", options: ["Stores secrets", "Manages external HTTP access to cluster services", "Monitors pods", "Scales deployments"], answer: 1 },
  ],

  // ── Data Science ──────────────────────────────────────────────────────────
  "SQL for Analytics": [
    { q: "What is a window function in SQL?", options: ["A GUI feature", "Function performing calculation across related rows without grouping", "A stored procedure", "An index type"], answer: 1 },
    { q: "What does ROW_NUMBER() do?", options: ["Counts all rows", "Assigns sequential number within a partition", "Ranks with gaps", "Counts per group"], answer: 1 },
    { q: "What is a CTE (Common Table Expression)?", options: ["A table type", "Named temporary result set defined with WITH clause", "An index", "A constraint"], answer: 1 },
    { q: "What does COALESCE() return?", options: ["MAX value", "First non-NULL value from a list", "NULL always", "SUM of values"], answer: 1 },
    { q: "What is the difference between INNER JOIN and LEFT JOIN?", options: ["No difference", "INNER returns matching rows; LEFT returns all from left + matches", "LEFT is faster", "INNER includes NULLs"], answer: 1 },
    { q: "What does GROUP BY do?", options: ["Sorts results", "Groups rows sharing a value for aggregate functions", "Filters results", "Joins tables"], answer: 1 },
    { q: "When does HAVING differ from WHERE?", options: ["No difference", "HAVING filters after GROUP BY; WHERE filters before", "WHERE is faster", "HAVING works on columns"], answer: 1 },
    { q: "What is query optimization?", options: ["Writing longer queries", "Improving query performance through indexes, rewrites, etc.", "Adding more joins", "Using subqueries"], answer: 1 },
    { q: "What does DENSE_RANK() differ from RANK()?", options: ["No difference", "DENSE_RANK has no gaps in ranking; RANK skips after ties", "RANK is newer", "DENSE_RANK is slower"], answer: 1 },
    { q: "What is an execution plan?", options: ["A project schedule", "How the database engine processes and executes a query", "A stored procedure", "A table schema"], answer: 1 },
  ],

  // ── Cybersecurity ─────────────────────────────────────────────────────────
  "Web Application Security": [
    { q: "What is the OWASP Top 10?", options: ["10 best frameworks", "List of top web security vulnerabilities", "10 security tools", "10 HTTPS rules"], answer: 1 },
    { q: "How do you prevent SQL injection?", options: ["Use HTTPS", "Use parameterized queries/prepared statements", "Validate email", "Use cookies"], answer: 1 },
    { q: "What is a CSRF attack?", options: ["SQL injection variant", "Trick user's browser into making unauthorized requests", "Script injection", "DDoS attack"], answer: 1 },
    { q: "What prevents XSS attacks?", options: ["HTTPS", "Escaping/sanitizing user input before rendering in HTML", "JWT tokens", "Rate limiting"], answer: 1 },
    { q: "What does Content Security Policy (CSP) do?", options: ["Speed up pages", "Prevent unauthorized script execution and data injection", "Compress files", "Cache pages"], answer: 1 },
    { q: "What is broken access control?", options: ["Broken login form", "Users accessing resources beyond their permissions", "Missing HTTPS", "Weak passwords"], answer: 1 },
    { q: "What tool is commonly used for web security testing?", options: ["Figma", "Burp Suite", "Postman", "Docker"], answer: 1 },
    { q: "What does 'insecure deserialization' mean?", options: ["Slow JSON parsing", "Exploiting flaws when processing untrusted serialized data", "Invalid MIME type", "Broken CORS"], answer: 1 },
    { q: "What is security misconfiguration?", options: ["Typing errors", "Default/incomplete security settings exposing vulnerabilities", "Missing validation", "Wrong headers"], answer: 1 },
    { q: "What is rate limiting used for?", options: ["Improving UX", "Preventing abuse by limiting requests per user/IP", "Caching responses", "Load balancing"], answer: 1 },
  ],
  "Penetration Testing": [
    { q: "What is reconnaissance in pen testing?", options: ["Exploiting vulnerabilities", "Gathering information about the target", "Reporting findings", "Patching systems"], answer: 1 },
    { q: "What does Nmap do?", options: ["Password cracking", "Network scanning and port discovery", "Exploit delivery", "Log analysis"], answer: 1 },
    { q: "What is a reverse shell?", options: ["A firewall rule", "Target machine connects back to attacker's machine", "SSH key", "Encrypted communication"], answer: 1 },
    { q: "What is social engineering?", options: ["Network hacking", "Manipulating people to reveal confidential information", "Code injection", "DDoS"], answer: 1 },
    { q: "What is the Metasploit Framework?", options: ["A firewall", "Open-source penetration testing and exploit framework", "A SIEM tool", "A monitoring tool"], answer: 1 },
    { q: "What is privilege escalation?", options: ["Getting admin access legitimately", "Gaining higher privileges than initially authorized", "User account creation", "Port forwarding"], answer: 1 },
    { q: "What is a CVE?", options: ["Code version entity", "Common Vulnerability and Exposure identifier for known flaws", "Certified vulnerability expert", "Container vulnerability exploit"], answer: 1 },
    { q: "What is the purpose of a pentest report?", options: ["Fix vulnerabilities automatically", "Document findings, risk, and remediation recommendations", "Monitor networks", "Train employees"], answer: 1 },
    { q: "What does OSINT stand for?", options: ["Online Security Intelligence", "Open Source Intelligence", "Operational Security Integration", "None"], answer: 1 },
    { q: "Which phase comes after exploitation in the pen testing lifecycle?", options: ["Reconnaissance", "Scanning", "Post-exploitation", "Reporting"], answer: 2 },
  ],
};

// Fallback generic questions if step not in bank
const FALLBACK_QUESTIONS: Q[] = [
  { q: "What is the importance of code reviews?", options: ["Wastes time", "Catches bugs early and shares knowledge", "Only for seniors", "Optional process"], answer: 1 },
  { q: "What is version control?", options: ["Versioning APIs", "Tracking changes to code over time", "Updating dependencies", "Semantic versioning"], answer: 1 },
  { q: "What does DRY principle stand for?", options: ["Do Repeat Yourself", "Don't Repeat Yourself", "Delete Redundant YAML", "Dry Run Your code"], answer: 1 },
  { q: "What is technical debt?", options: ["Paying for servers", "Cost of shortcuts in code that slow future development", "Unpaid licenses", "Legacy servers"], answer: 1 },
  { q: "What is a pull request?", options: ["Downloading code", "Requesting code review before merging changes", "Pulling from a database", "API request type"], answer: 1 },
  { q: "What is Agile development?", options: ["Fast hardware", "Iterative, collaborative development methodology", "A programming language", "A CI/CD tool"], answer: 1 },
  { q: "What does unit testing test?", options: ["Entire system", "Smallest individual units of code", "UI only", "Database queries only"], answer: 1 },
  { q: "What is the purpose of documentation?", options: ["Slow development", "Explain code behavior for future developers", "Legal requirement", "Generate code"], answer: 1 },
  { q: "What does refactoring mean?", options: ["Rewriting in new language", "Improving code structure without changing behavior", "Optimizing database", "Redesigning UI"], answer: 1 },
  { q: "What is semantic versioning (semver)?", options: ["Naming variables", "Version numbering: MAJOR.MINOR.PATCH", "Commit messages", "Branch naming"], answer: 1 },
];

const PASS_THRESHOLD = 7;
const TOTAL_QUESTIONS = 10;

function getQuestions(stepTitle: string): Q[] {
  const bank = QUESTION_BANK[stepTitle] || FALLBACK_QUESTIONS;
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, TOTAL_QUESTIONS);
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  step: { stepId: number; title: string; category: string; xp: number };
  onPass: () => void;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const StepQuiz = ({ step, onPass, onClose }: Props) => {
  const questions = useMemo(() => getQuestions(step.title), [step.title]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");

  const score = answers.filter((a, i) => a === questions[i]?.answer).length;
  const passed = score >= PASS_THRESHOLD;
  const currentQ = questions[qIndex];

  const handleChoose = (optIndex: number) => {
    if (showFeedback) return;
    setChosen(optIndex);
    setShowFeedback(true);

    const newAnswers = [...answers, optIndex];

    setTimeout(() => {
      if (qIndex < questions.length - 1) {
        setAnswers(newAnswers);
        setQIndex(qIndex + 1);
        setChosen(null);
        setShowFeedback(false);
      } else {
        setAnswers(newAnswers);
        setPhase("result");
      }
    }, 900);
  };

  const retry = () => {
    setQIndex(0);
    setAnswers([]);
    setChosen(null);
    setShowFeedback(false);
    setPhase("quiz");
  };

  const progressPct = Math.round(((qIndex + 1) / questions.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        className="glass-card p-6 max-w-xl w-full neon-glow-cyan max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-xs text-muted-foreground">{step.category} · Completion Test</p>
            <h2 className="font-display font-bold text-lg">{step.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors shrink-0">
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Pass requirement notice */}
        <div className="mb-4 flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
          <Trophy size={13} />
          Score {PASS_THRESHOLD}/{TOTAL_QUESTIONS} or higher to complete this step and unlock the next
        </div>

        <AnimatePresence mode="wait">
          {/* ── Quiz phase ── */}
          {phase === "quiz" && (
            <motion.div key="quiz" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Question {qIndex + 1} of {questions.length}</span>
                  <span className="text-primary font-medium">{score} correct so far</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={qIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  <p className="font-semibold text-base leading-snug mb-4">{currentQ.q}</p>
                  {currentQ.options.map((opt, i) => {
                    const isChosen = chosen === i;
                    const isCorrect = i === currentQ.answer;
                    let style = "border-border hover:border-primary/40 glass";
                    if (showFeedback) {
                      if (isCorrect) style = "border-neon-green bg-neon-green/10";
                      else if (isChosen && !isCorrect) style = "border-destructive bg-destructive/10";
                      else style = "border-border glass opacity-50";
                    } else if (isChosen) {
                      style = "border-primary bg-primary/10";
                    }
                    return (
                      <motion.button
                        key={i}
                        whileHover={!showFeedback ? { scale: 1.01 } : {}}
                        whileTap={!showFeedback ? { scale: 0.99 } : {}}
                        onClick={() => handleChoose(i)}
                        className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${style}`}
                      >
                        <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                          showFeedback && isCorrect ? "border-neon-green text-neon-green" :
                          showFeedback && isChosen && !isCorrect ? "border-destructive text-destructive" :
                          "border-muted-foreground text-muted-foreground"
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1 text-sm">{opt}</span>
                        {showFeedback && isCorrect && <CheckCircle2 size={16} className="text-neon-green shrink-0" />}
                        {showFeedback && isChosen && !isCorrect && <XCircle size={16} className="text-destructive shrink-0" />}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Result phase ── */}
          {phase === "result" && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Score ring */}
              <div className="flex flex-col items-center py-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="relative w-28 h-28 mb-3"
                >
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                    <motion.circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke={passed ? "hsl(var(--neon-green, 74 222 128))" : "hsl(var(--destructive))"}
                      strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - score / questions.length) }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {passed ? <Trophy size={18} className="text-neon-green mb-0.5" /> : <BookOpen size={18} className="text-destructive mb-0.5" />}
                    <span className="text-xl font-bold">{score}/{questions.length}</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  {passed ? (
                    <>
                      <p className="text-xl font-bold font-display text-neon-green">🎉 Test Passed!</p>
                      <p className="text-sm text-muted-foreground mt-1">Excellent! +{step.xp} XP earned. Next step unlocked.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-bold font-display text-destructive">Not Quite</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You need {PASS_THRESHOLD}/10 to pass. You got {score}/10.{" "}
                        {PASS_THRESHOLD - score} more correct answer{PASS_THRESHOLD - score !== 1 ? "s" : ""} needed.
                      </p>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Per-question breakdown */}
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Answer Breakdown</p>
                {questions.map((q, i) => {
                  const correct = answers[i] === q.answer;
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      {correct
                        ? <CheckCircle2 size={13} className="text-neon-green shrink-0 mt-0.5" />
                        : <XCircle size={13} className="text-destructive shrink-0 mt-0.5" />}
                      <span className={correct ? "text-foreground" : "text-muted-foreground"}>
                        {q.q}
                        {!correct && (
                          <span className="text-neon-green ml-1">→ {q.options[q.answer]}</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={retry}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg glass border border-border text-sm hover:bg-white/5 transition-colors"
                >
                  <RotateCcw size={14} /> Retry Test
                </button>
                {passed && (
                  <motion.button
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onPass}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
                  >
                    Complete Step <ChevronRight size={14} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default StepQuiz;
