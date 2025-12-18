import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "../../lib/utils"

const DropdownMenuContext = React.createContext({})

const DropdownMenu = ({ children }) => {
    const [open, setOpen] = React.useState(false)
    const menuRef = React.useRef(null)

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block text-left" ref={menuRef}>
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

const DropdownMenuTrigger = ({ children, asChild, ...props }) => {
    const { open, setOpen } = React.useContext(DropdownMenuContext)

    const Comp = asChild ? React.Slot : "button"
    // If we don't have Slot (no radix), we just clone element if valid
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: (e) => {
                children.props.onClick?.(e)
                setOpen(!open)
            },
            "data-state": open ? "open" : "closed",
            ...props
        })
    }

    return (
        <button
            onClick={() => setOpen(!open)}
            data-state={open ? "open" : "closed"}
            {...props}
        >
            {children}
        </button>
    )
}

const DropdownMenuContent = ({ className, children, align = "center", forceMount, ...props }) => {
    const { open } = React.useContext(DropdownMenuContext)

    const alignmentClasses = {
        start: "left-0",
        center: "left-1/2 -translate-x-1/2",
        end: "right-0 top-full",
    }

    return (
        <AnimatePresence>
            {(open || forceMount) && (
                open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 5 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className={cn(
                            "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md bg-white border-gray-200 mt-2",
                            alignmentClasses[align] || "left-0",
                            className
                        )}
                        {...props}
                    >
                        {children}
                    </motion.div>
                )
            )}
        </AnimatePresence>
    )
}

const DropdownMenuItem = ({ className, children, inset, onClick, ...props }) => {
    const { setOpen } = React.useContext(DropdownMenuContext)

    return (
        <div
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100 cursor-pointer",
                inset && "pl-8",
                className
            )}
            onClick={(e) => {
                onClick?.(e);
                setOpen(false);
            }}
            {...props}
        >
            {children}
        </div>
    )
}

const DropdownMenuLabel = ({ className, inset, ...props }) => (
    <div
        className={cn(
            "px-2 py-1.5 text-sm font-semibold",
            inset && "pl-8",
            className
        )}
        {...props}
    />
)

const DropdownMenuSeparator = ({ className, ...props }) => (
    <div
        className={cn("-mx-1 my-1 h-px bg-muted bg-gray-100", className)}
        {...props}
    />
)

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
}
