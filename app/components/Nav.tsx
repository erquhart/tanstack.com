import { Link } from 'remix'

const links = [
  { href: 'https://github.com/tannerlinsley', label: 'GitHub' },
  { href: 'https://discord.com/invite/WrRKjPJ', label: 'Discord' },
]

export function Nav() {
  return (
    <nav className={`max-w-screen-md mx-auto text-white`}>
      <ul className={`flex items-center justify-between p-8`}>
        <li>
          <Link to="/">
            <img
              src={require('../images/logo-white.svg')}
              alt="TanStack Logo"
              width={100}
              height={20}
            />
          </Link>
        </li>
        <ul className={`flex items-center justify-between space-x-2`}>
          {links.map(({ href, label }) => (
            <li key={`${href}${label}`}>
              <a
                href={href}
                className={`inline px-2 py-1 rounded-md transition-all hover:bg-gray-900 hover:bg-opacity-20`}
                target="_blank"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </ul>
    </nav>
  )
}
