export function Footer() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-3 border-t border-border/50">
      {/* Copyright */}
      <a 
        href="https://www.github.com/statikfintechllc/IB-G.Scanner/blob/master/LICENSE.md"
        className="text-xs text-blue-500 hover:text-blue-400 transition-colors no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        © 2025 StatikFinTech, LLC
      </a>

      {/* Social Media Badges */}
      <div className="flex items-center gap-1">
        <a 
          href="https://github.com/statikfintechllc"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          <img 
            src="https://img.shields.io/badge/-000000?logo=github&logoColor=white&style=flat-square" 
            alt="GitHub"
            className="h-4"
          />
        </a>
        
        <a 
          href="https://www.linkedin.com/in/daniel-morris-780804368"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          <img 
            src="https://img.shields.io/badge/In-e11d48?logo=linkedin&logoColor=white&style=flat-square" 
            alt="LinkedIn"
            className="h-4"
          />
        </a>
        
        <a 
          href="mailto:ascend.gremlin@gmail.com"
          className="transition-opacity hover:opacity-80"
        >
          <img 
            src="https://img.shields.io/badge/-D14836?logo=gmail&logoColor=white&style=flat-square" 
            alt="Email"
            className="h-4"
          />
        </a>
        
        <a 
          href="https://www.youtube.com/@Gremlins_Forge"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          <img 
            src="https://img.shields.io/badge/-FF0000?logo=youtube&logoColor=white&style=flat-square" 
            alt="YouTube"
            className="h-4"
          />
        </a>
        
        <a 
          href="https://x.com/GremlinsForge"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          <img 
            src="https://img.shields.io/badge/-000000?logo=x&logoColor=white&style=flat-square" 
            alt="X"
            className="h-4"
          />
        </a>
        
        <a 
          href="https://medium.com/@ascend.gremlin"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80"
        >
          <img 
            src="https://img.shields.io/badge/-000000?logo=medium&logoColor=white&style=flat-square" 
            alt="Medium"
            className="h-4"
          />
        </a>
      </div>
    </div>
  );
}
