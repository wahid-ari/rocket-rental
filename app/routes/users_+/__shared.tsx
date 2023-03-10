import * as Separator from '@radix-ui/react-separator'
import { redirect } from '@remix-run/node'
import { Form, useLocation, useNavigation } from '@remix-run/react'
import * as React from 'react'
import { StarRatingDisplay } from '~/components/star-rating-display'
import { prisma } from '~/utils/db.server'
import { Button, ButtonLink } from '~/utils/forms'
import { getUserImgSrc } from '~/utils/misc'

export async function createChat({
	loggedInUserId,
	username,
}: {
	loggedInUserId: string
	username: string
}) {
	const existingChat = await prisma.chat.findFirst({
		where: {
			AND: [
				{ users: { some: { id: loggedInUserId } } },
				{ users: { some: { username } } },
			],
		},
		select: { id: true },
	})
	if (existingChat) {
		return redirect(`/chats/${existingChat.id}`)
	}

	const createdChat = await prisma.chat.create({
		select: { id: true },
		data: {
			users: {
				connect: [{ id: loggedInUserId }, { username }],
			},
		},
	})
	return redirect(`/chats/${createdChat.id}`)
}

export function UserProfileBasicInfo({
	user,
	rating,
	userJoinedDisplay,
	userLoggedIn,
	isSelf,
	oneOnOneChatId,
	stats,
	bio,
}: {
	user: { imageId: string | null; username: string; name: string | null }
	oneOnOneChatId?: string | null
	userLoggedIn: boolean
	isSelf: boolean
	rating: number | null
	userJoinedDisplay: string
	stats: Array<{ num: number; label: string }>
	bio?: string | null
}) {
	const location = useLocation()
	return (
		<>
			<div className="container mx-auto rounded-3xl bg-night-muted p-12">
				<div className="grid grid-cols-2 justify-items-center">
					<div className="relative w-52">
						<div className="absolute -top-40">
							<div className="relative">
								<img
									src={getUserImgSrc(user.imageId)}
									alt={user.username}
									className="h-52 w-52 rounded-full object-cover"
								/>
								{rating ? (
									<div className="absolute -bottom-3 flex w-full justify-center">
										<StarRatingDisplay rating={rating} />
									</div>
								) : null}
							</div>
						</div>
					</div>

					<div className="h-20" />

					<div className="flex flex-col items-center">
						<div className="flex flex-wrap items-center justify-center gap-4">
							<h1 className="text-center text-4xl font-bold text-white">
								{user.name ?? user.username}
							</h1>
							{isSelf ? null : oneOnOneChatId ? (
								<ButtonLink
									to={`/chats/${oneOnOneChatId}`}
									variant="primary"
									size="xs"
									title="Go to chat"
								>
									✉️ Message
								</ButtonLink>
							) : userLoggedIn ? (
								<Form method="post">
									<Button
										variant="primary"
										size="xs"
										type="submit"
										name="intent"
										value="create-chat"
										title="Start new chat"
									>
										✉️ Message
									</Button>
								</Form>
							) : (
								<ButtonLink
									to={`/login?${new URLSearchParams({
										redirectTo: location.pathname,
									})}`}
									variant="primary"
									size="xs"
									title="Login to message"
								>
									✉️ Message
								</ButtonLink>
							)}
						</div>
						<p className="mt-2 text-center text-gray-500">
							Joined {userJoinedDisplay}
						</p>
						{isSelf ? (
							<div className="mt-10 flex gap-4">
								<ButtonLink to="/chats" variant="primary" size="medium">
									✉️ My chat
								</ButtonLink>
								<ButtonLink
									to="/settings/profile"
									variant="secondary"
									size="medium"
								>
									✏️ Edit profile
								</ButtonLink>
							</div>
						) : null}
					</div>
					<div className="flex items-center justify-between justify-self-end text-center">
						{stats.map(({ num, label }, index) => (
							<React.Fragment key={index}>
								{index > 0 ? (
									<Separator.Root
										orientation="vertical"
										className="h-14 w-[1.5px] bg-night-lite"
									/>
								) : null}
								<div className="min-w-[120px] px-5">
									<div className="text-3xl font-bold text-white">{num}</div>
									<span className="text-gray-500">{label}</span>
								</div>
							</React.Fragment>
						))}
					</div>
				</div>
			</div>
			<div className="container mx-auto mt-6">
				<div className="grid grid-cols-2 gap-6">
					<div className="rounded-3xl bg-night-muted p-10">
						<h2 className="font-3xl font-bold text-white">Verified Info</h2>
						<div className="mt-8 flex items-center justify-around text-center">
							<div className="flex flex-col items-center justify-center">
								<div className="flex h-8 w-8 items-center justify-center">
									🛡
								</div>
								<div className="mt-3 max-w-[92px] leading-5 text-label-light-gray">
									Approved to fly
								</div>
							</div>
							<Separator.Root
								orientation="vertical"
								className="h-14 w-[1.5px] bg-night-lite"
							/>
							<div className="flex flex-col items-center justify-center">
								<div className="flex h-8 w-8 items-center justify-center">
									🛡
								</div>
								<div className="mt-3 max-w-[92px] leading-5 text-label-light-gray">
									Email address
								</div>
							</div>
							<Separator.Root
								orientation="vertical"
								className="h-14 w-[1.5px] bg-night-lite"
							/>
							<div className="flex flex-col items-center justify-center">
								<div className="flex h-8 w-8 items-center justify-center">
									🛡
								</div>
								<div className="mt-3 max-w-[92px] leading-5 text-label-light-gray">
									Phone number
								</div>
							</div>
						</div>
						<h2 className="font-3xl mt-14 font-bold text-white">
							Share this profile
						</h2>
						<div className="mt-4 flex gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-night-muted-dark text-white">
								f
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-night-muted-dark text-white">
								t
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-night-muted-dark text-white">
								i
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-night-muted-dark text-white">
								c
							</div>
						</div>
					</div>
					<div className="rounded-3xl bg-night-muted p-10">
						<h2 className="font-3xl font-bold text-white">About</h2>
						<p className="mt-6 max-h-56 overflow-y-scroll text-label-light-gray">
							{bio ?? 'No bio provided'}
						</p>
					</div>
				</div>
			</div>
		</>
	)
}
