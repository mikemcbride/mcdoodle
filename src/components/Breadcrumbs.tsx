import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'
import { Link } from '@tanstack/react-router';

interface Page {
  name: string;
  href: string;
  current?: boolean;
}

export default function Breadcrumbs({ pages }: { pages: Page[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex mb-8">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <Link to="/" className="text-gray-400 hover:text-gray-500">
              <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {pages.map((page) => (
          <li key={page.name}>
            <div className="flex items-center">
              <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
              <Link
                to={page.href}
                aria-current={page.current ? 'page' : undefined}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {page.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}

