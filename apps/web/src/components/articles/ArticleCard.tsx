import Link from 'next/link';

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt?: string;
  authorName?: string;
  publishedAt?: string;
  contentType?: string;
}

/**
 * ArticleCard — content listing card for articles and papers.
 * Ref: content-lifecycle.md §published
 */
export function ArticleCard({ slug, title, excerpt, authorName, publishedAt, contentType = 'article' }: ArticleCardProps) {
  return (
    <Link href={`/articles/${slug}`} className="card hover:border-primary-300 transition group block space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full capitalize">
          {contentType}
        </span>
        {publishedAt && (
          <span className="text-xs text-gray-400">
            {new Date(publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 line-clamp-2">{title}</h3>
      {excerpt && <p className="text-sm text-gray-500 line-clamp-2">{excerpt}</p>}
      {authorName && <p className="text-xs text-gray-400">oleh {authorName}</p>}
    </Link>
  );
}
