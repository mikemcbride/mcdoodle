import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext.js'
import { UserCircleIcon, UserIcon, UsersIcon, KeyIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/20/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AppMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()

  function handleSignOut() {
    logout()
  }
  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="relative flex text-sm text-white items-center gap-2">
          <span className="sr-only">Open user menu</span>
          <UserCircleIcon className="h-6 w-6" />
          <span className="hidden md:block">{user.firstName}</span>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {user.isAdmin && <Menu.Item>
            {({ active }) => (
              <Link
                href="/admin"
                className={classNames(active ? 'bg-gray-100' : '', 'px-4 py-2 text-sm text-gray-700 flex items-center gap-4')}
              >
                <KeyIcon className="h-4 w-4 text-gray-500" />
                <span>Admin</span>
              </Link>
            )}
          </Menu.Item>}
          {user.isAdmin && <Menu.Item>
            {({ active }) => (
              <Link
                href="/users"
                className={classNames(active ? 'bg-gray-100' : '', 'flex px-4 py-2 text-sm text-gray-700 items-center gap-4')}
              >
                <UsersIcon className="h-4 w-4 text-gray-500" />
                <span>Manage Users</span>
              </Link>
            )}
          </Menu.Item>}
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/profile"
                className={classNames(active ? 'bg-gray-100' : '', 'px-4 py-2 text-sm text-gray-700 flex items-center gap-4')}
              >
                <UserIcon className="h-4 w-4 text-gray-500" />
                <span>Profile</span>
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                type="button"
                className={classNames(active ? 'bg-gray-100' : '', 'px-4 py-2 text-sm text-gray-700 w-full flex items-center gap-4')}
                onClick={handleSignOut}>
                <ArrowLeftOnRectangleIcon className="h-4 w-4 text-gray-500" />
                <span>Sign out</span>
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
