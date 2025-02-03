import { Button } from "@/components/ui/button"
import LoginDialog from "./login-dialog"

export default function GetStartedBanner() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-black"></div>
      <div className="container relative mx-auto py-16 px-4 z-10">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 shadow-lg border border-white/20">
          <h2 className="text-3xl font-semibold mb-4 text-white">Ready to Transform Your Data?</h2>
          <p className="text-lg mb-6 text-gray-300 max-w-2xl">
            Start visualizing your data and uncovering insights with DataXpert. Sign in now and get started!
          </p>
          <LoginDialog title='Try Now'/>
        </div>
      </div>
      <svg
        className="absolute top-0 left-0 w-32 h-32 text-white/5"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M44.9,-76.2C59.7,-69.8,74,-59.3,83.1,-45.3C92.2,-31.3,96.1,-13.9,94.4,2.9C92.8,19.8,85.6,36,74.6,48.6C63.6,61.2,48.8,70.1,33.5,75.7C18.2,81.3,2.4,83.5,-13.4,81.6C-29.2,79.7,-45,73.6,-58.6,63.5C-72.2,53.4,-83.6,39.4,-89.5,23.3C-95.4,7.2,-95.8,-11,-90.2,-27C-84.6,-43.1,-73,-57,-58.6,-64.4C-44.2,-71.8,-27,-72.7,-10.8,-71.5C5.5,-70.3,30.1,-82.6,44.9,-76.2Z"
          transform="translate(100 100)"
        />
      </svg>
      <svg
        className="absolute bottom-0 right-0 w-40 h-40 text-white/5"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M38.9,-65.7C49.8,-57.8,57.9,-46.1,65.6,-33.3C73.3,-20.5,80.7,-6.6,79.6,6.5C78.6,19.6,69.1,31.9,59.3,42.4C49.5,52.9,39.4,61.6,27.5,66.6C15.6,71.5,1.9,72.7,-12.7,71.6C-27.4,70.5,-43,67.1,-54.3,58.5C-65.6,49.9,-72.6,36.1,-76.9,21.5C-81.2,6.8,-82.8,-8.7,-78.2,-21.8C-73.6,-34.9,-62.8,-45.6,-50.8,-53.3C-38.8,-61,-25.5,-65.7,-11.8,-67.8C1.9,-69.9,28,-73.5,38.9,-65.7Z"
          transform="translate(100 100)"
        />
      </svg>
    </section>
  )
}

