import * as React from 'react'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  LinksFunction,
  useMatches,
  MetaFunction,
} from 'remix'

import styles from './styles/app.generated.css'
import prismThemeLight from './styles/prismThemeLight.css'
import prismThemeDark from './styles/prismThemeDark.css'
import docsearchCss from '@docsearch/css/dist/style.css'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1',
  title: 'React Table',
  description: `🤖 Headless UI for building powerful tables & datagrids for TS/JS, React, Vue, Solid`,
})

export let links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: styles },
    {
      rel: 'stylesheet',
      href: prismThemeLight,
      media: '(prefers-color-scheme: light)',
    },
    {
      rel: 'stylesheet',
      href: prismThemeDark,
      media: '(prefers-color-scheme: dark)',
    },
    {
      rel: 'stylesheet',
      href: docsearchCss,
    },
    {
      rel: 'stylesheet',
      href: require('./styles/carbon.css'),
    },
  ]
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

function Document({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}) {
  const matches = useMatches()
  // const styles = useStylesLink()

  return (
    // <html lang="en" className={cx(getGlobalStyles())}>
    <html lang="en">
      <head>
        {/* {styles} */}
        {matches.find((d) => d.handle?.baseParent) ? (
          <base target="_parent" />
        ) : null}
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}

export function CatchBoundary() {
  let caught = useCatch()

  let message
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      )
      break
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      )
      break

    default:
      throw new Error(caught.data || caught.statusText)
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <h1>
        {caught.status}: {caught.statusText}
      </h1>
      {message}
    </Document>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)
  return (
    <Document title="Error!">
      <div>
        <h1>There was an error!</h1>
        <p>{error.message}</p>
      </div>
    </Document>
  )
}
