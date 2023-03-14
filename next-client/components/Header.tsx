'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef } from 'react';
import { toast } from 'react-hot-toast';

const Header = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = inputRef.current?.value;
    if (!input) return;

    const notification = toast.loading(`Starting a Scraper for: ${input}`);

    if (inputRef.current?.value) {
      inputRef.current.value = '';
    }

    try {
      // Call out API to activate the scraper
      console.log('Calling API to activate scrapper');

      const response = await fetch('/api/activateScraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search: input }),
      });

      const { collection_id, start_eta } = await response.json();

      toast.success('Scraper started successfully', { id: notification });

      router.push(`/search/${collection_id}`);
    } catch (error) {
      // Handle any errors
      console.log('ERROR >>>', error);

      toast.error('Whoops... Something went wrong!', {
        id: notification,
      });
    }
  };

  return (
    <header>
      <form
        onSubmit={handleSearch}
        className="flex items-center space-x-2 justify-center rounded-full py-2 px-4 bg-indigo-100 max-w-md mx-auto"
      >
        <input
          ref={inputRef}
          className="flex-1 outline-none bg-transparent text-indigo-400 placeholder:text-indigo-300"
          type="text"
          placeholder="Search..."
        />
        <button hidden>Search</button>
        <MagnifyingGlassIcon className="h-6 w-6 text-indigo-300" />
      </form>
    </header>
  );
};

export default Header;
