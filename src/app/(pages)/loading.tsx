import { Loader2 } from "lucide-react"
const Loading = () => {
    return (
        <div className="w-full flex items-center justify-center pt-10">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    )
}

export default Loading