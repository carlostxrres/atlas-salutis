import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IconWorld, IconBrandYoutube, IconBrandInstagram } from '@tabler/icons-react';
import { initials } from '@/lib/utils';

export interface PersonProfileHeaderProps {
  name: string;
  role: 'interviewee' | 'interviewer' | 'both';
  profession?: string;
  photo?: string;
  links?: {
    website?: string;
    youtube?: string;
    instagram?: string;
  };
}

const roleLabel: Record<PersonProfileHeaderProps['role'], string> = {
  interviewee: 'Entrevistado/a',
  interviewer: 'Entrevistador/a',
  both: 'Entrevistado/a y entrevistador/a',
};

export default function PersonProfileHeader({ name, role, profession, photo, links }: PersonProfileHeaderProps) {
  const hasLinks = links && (links.website || links.youtube || links.instagram);

  return (
    <div className="not-content mb-6 flex flex-wrap items-center gap-4">
      <Avatar className="size-20">
        {photo ? (
          <AvatarImage src={photo} alt={name} />
        ) : (
          <AvatarFallback className="text-lg">{initials(name)}</AvatarFallback>
        )}
      </Avatar>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{roleLabel[role]}</Badge>
          {profession && <span className="text-muted-foreground text-sm">{profession}</span>}
        </div>

        {hasLinks && (
          <div className="flex gap-3">
            {links?.website && (
              <a href={links.website} className="text-muted-foreground hover:text-foreground" aria-label="Sitio web">
                <IconWorld className="size-5" />
              </a>
            )}
            {links?.youtube && (
              <a href={links.youtube} className="text-muted-foreground hover:text-foreground" aria-label="YouTube">
                <IconBrandYoutube className="size-5" />
              </a>
            )}
            {links?.instagram && (
              <a
                href={links.instagram}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Instagram"
              >
                <IconBrandInstagram className="size-5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
