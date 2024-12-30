import * as React from 'react'
import { FaEdit } from 'react-icons/fa'
import { marked } from 'marked'
import markedAlert from 'marked-alert'
import { gfmHeadingId, getHeadingList } from 'marked-gfm-heading-id'
import { DocTitle } from '~/components/DocTitle'
import { Markdown } from '~/components/Markdown'
import { Toc } from './Toc'
import { twMerge } from 'tailwind-merge'
import * as Selection from 'selection-popover'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Slot } from '@radix-ui/react-slot'
import {
  TwitterLogoIcon,
  GitHubLogoIcon,
  CopyIcon,
  Pencil1Icon,
} from '@radix-ui/react-icons'
import { useState } from 'react'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import { useMutation } from 'convex/react'

type ButtonElement = React.ElementRef<'button'>
type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  asChild?: boolean
}

export const Button = React.forwardRef<ButtonElement, ButtonProps>(
  ({ className, asChild = false, ...props }, forwardedRef) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        {...props}
        ref={forwardedRef}
        className={twMerge(
          'h-7 px-1 rounded text-mauve11 hover:bg-violet3 hover:text-violet11 inline-flex items-center justify-center gap-2 text-sm outline-none leading-none',
          'focus:ring-2 focus:ring-violet7',
          className
        )}
      />
    )
  }
)
Button.displayName = 'Button'

type TooltipProps = {
  children: React.ReactNode
  content: string
}
export const Tooltip = ({ children, content }: TooltipProps) => {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className="text-violet11 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity] data-[state=delayed-open]:animate-slideDownAndFade"
          side="top"
          sideOffset={5}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-white" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

type DocProps = {
  title: string
  content: string
  repo: string
  branch: string
  filePath: string
  shouldRenderToc?: boolean
  colorFrom?: string
  colorTo?: string
}

export function Doc({
  title,
  content,
  repo,
  branch,
  filePath,
  shouldRenderToc = false,
  colorFrom,
  colorTo,
}: DocProps) {
  const [selectionPath, setSelectionPath] = useState<number[]>([])
  const containerRef = React.useRef<HTMLDivElement>(null)

  const setHighlight = useMutation(api.highlight.highlight)
  const deleteHighlight = useMutation(api.highlight.deleteHighlight)
  const highlights = useQuery(api.highlight.getHighlights, {
    title: title,
  })

  const { markup, headings } = React.useMemo(() => {
    const markup = marked.use(
      { gfm: true },
      gfmHeadingId(),
      markedAlert()
    )(content) as string

    const headings = getHeadingList()

    return { markup, headings }
  }, [content])

  const isTocVisible = shouldRenderToc && headings && headings.length > 1
  const getPath = (
    selectedNode: Node,
    focusNode: Node,
    anchorOffset: number,
    focusOffset: number
  ) => {
    if (selectedNode.parentNode !== focusNode.parentNode) {
      return
    }
    const path = [anchorOffset, focusOffset]
    let currentNode = selectedNode
    while (currentNode && currentNode !== containerRef.current) {
      const index = Array.from(
        currentNode?.parentNode?.childNodes || []
      ).indexOf(currentNode as ChildNode)
      if (index < 0) {
        console.log('not found', currentNode, 'in', currentNode?.parentNode)
      }
      console.log('index', index)
      console.log('path', path)
      console.log('currentNode', currentNode)
      path.unshift(index)
      currentNode = currentNode?.parentNode as Node
    }
    return path
  }
  return (
    <Selection.Root
      onOpenChange={(isOpen) => {
        const selection = window.getSelection()
        if (!selection?.anchorNode || !selection?.focusNode) {
          return
        }
        const path = getPath(
          selection?.anchorNode,
          selection?.focusNode,
          selection?.anchorOffset,
          selection?.focusOffset
        )
        if (!path) {
          return
        }
        setSelectionPath(path)
      }}
    >
      <div
        className={twMerge(
          'w-full flex bg-white/70 dark:bg-black/50 mx-auto rounded-xl max-w-[936px]',
          isTocVisible && 'max-w-full'
        )}
      >
        <div
          className={twMerge(
            'flex overflow-auto flex-col w-full p-4 lg:p-6',
            isTocVisible && 'border-r border-gray-500/20 !pr-0'
          )}
        >
          {title ? <DocTitle>{title}</DocTitle> : null}
          <div className="h-4" />
          <div className="h-px bg-gray-500 opacity-20" />
          <div className="h-4" />
          <Selection.Trigger asChild>
            <div
              ref={containerRef}
              className={twMerge(
                'prose prose-gray prose-sm prose-p:leading-7 dark:prose-invert max-w-none',
                isTocVisible && 'pr-4 lg:pr-6'
              )}
            >
              <Markdown
                htmlMarkup={markup}
                highlights={highlights?.map((h) => h.path) ?? []}
              />
            </div>
          </Selection.Trigger>
          <div className="h-12" />
          <div className="w-full h-px bg-gray-500 opacity-30" />
          <div className="py-4 opacity-70">
            <a
              href={`https://github.com/${repo}/tree/${branch}/${filePath}`}
              className="flex items-center gap-2"
            >
              <FaEdit /> Edit on GitHub
            </a>
          </div>
          <div className="h-24" />
        </div>

        {isTocVisible && (
          <div className="max-w-52 w-full hidden 2xl:block transition-all">
            <Toc headings={headings} colorFrom={colorFrom} colorTo={colorTo} />
          </div>
        )}
      </div>
      <Selection.Portal>
        <Selection.Content
          sideOffset={8}
          className={twMerge(
            'flex items-center gap-1 w-full min-w-max rounded-md bg-white shadow-xl shadow-blackA6 px-2.5 h-10',
            'data-[state=open]:animate-slideDownAndFade data-[state=closed]:animate-slideUpAndFade'
          )}
        >
          <Button
            onClick={(e) => {
              if (highlights?.some((h) => h.path === selectionPath)) {
                deleteHighlight({
                  id: highlights.find((h) => h.path === selectionPath)?.id,
                })
                return
              }
              if (selectionPath.length > 0 && selectionPath[1] === 0) {
                setHighlight({
                  title: title,
                  path: selectionPath,
                })
              }
            }}
          >
            <Pencil1Icon className="w-5 h-5 text-gray-500" />
          </Button>
          <Button>
            <CopyIcon className="w-5 h-5 text-gray-500" />
          </Button>
          <Button asChild>
            <a
              href="https://twitter.com/joaom__00"
              target="_blank"
              rel="noreferrer noopener"
            >
              <TwitterLogoIcon className="w-5 h-5 text-gray-500" />
            </a>
          </Button>
          <Button asChild>
            <a
              href="https://github.com/joaom00"
              target="_blank"
              rel="noreferrer noopener"
            >
              <GitHubLogoIcon className="w-5 h-5 text-gray-500" />
            </a>
          </Button>
          <Selection.Arrow className="fill-white" />
        </Selection.Content>
      </Selection.Portal>
    </Selection.Root>
  )
}
