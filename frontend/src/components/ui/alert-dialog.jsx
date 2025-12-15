import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"
import { Button } from "./button"

const AlertDialogContext = React.createContext({})

const AlertDialog = ({ children, open, onOpenChange }) => {
    return (
        <AlertDialogContext.Provider value={{ open, onOpenChange }}>
            <AnimatePresence>
                {open && children}
            </AnimatePresence>
        </AlertDialogContext.Provider>
    )
}

const AlertDialogContent = ({ children, className }) => {
    const { onOpenChange } = React.useContext(AlertDialogContext)
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                    "fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-4 sm:p-6 shadow-lg duration-200 rounded-lg sm:rounded-lg mx-4",
                    className
                )}
            >
                {children}
            </motion.div>
        </>
    )
}

const AlertDialogHeader = ({ className, ...props }) => (
    <div
        className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
        {...props}
    />
)

const AlertDialogFooter = ({ className, ...props }) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold", className)}
        {...props}
    />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef(({ className, onClick, ...props }, ref) => {
    const { onOpenChange } = React.useContext(AlertDialogContext)
    return (
        <Button
            ref={ref}
            className={cn(className)}
            onClick={(e) => {
                onClick?.(e)
                onOpenChange(false)
            }}
            {...props}
        />
    )
})
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef(({ className, onClick, ...props }, ref) => {
    const { onOpenChange } = React.useContext(AlertDialogContext)
    return (
        <Button
            ref={ref}
            variant="outline"
            className={cn("mt-2 sm:mt-0", className)}
            onClick={(e) => {
                onClick?.(e)
                onOpenChange(false)
            }}
            {...props}
        />
    )
})
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
}
