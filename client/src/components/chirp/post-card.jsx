import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import {
  Heart,
  MessageCircle,
  MoreVertical,
  ChevronRightIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Input } from "/src/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

export default function PostCard({ post, onDelete, onCloseModal }) {
  const { user, token, loading } = useAuth();
  const [showAllComments, setShowAllComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.caption);
  const [isSaving, setIsSaving] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post._count?.comments || 0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);

  useEffect(() => {
    if (user && post.likes) {
      setLiked(post.likes.some((like) => like.userId === user.id));
    }
  }, [post.likes, user]);

  const handleLike = async () => {
    if (!user || !token) return;

    const previousLiked = liked;

    // Optimistic UI update
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      if (!previousLiked) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/posts/${post.id}/like`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/posts/${post.id}/like`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err) {
      console.error("Failed to like/unlike post:", err);

      // Rollback if request fails
      setLiked(previousLiked);
      setLikeCount((prev) => (previousLiked ? prev + 1 : prev - 1));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;

    const commentToDelete = comments.find((c) => c.id === commentId);
    if (!commentToDelete) return;

    // Optimistic removal
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentCount((prev) => prev - 1);

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/posts/${
          post.id
        }/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to delete comment", err);
      // Rollback on failure
      setComments((prev) => [...prev, commentToDelete]);
      setCommentCount((prev) => prev + 1);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const optimisticComment = {
      id: crypto.randomUUID(),
      text: newComment,
      createdAt: new Date().toISOString(),
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
    };

    // Optimistic UI
    setComments((prev) => [...prev, optimisticComment]);
    setCommentCount((prev) => prev + 1);
    setNewComment("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/posts/${post.id}/comments`,
        { text: optimisticComment.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Replace optimistic comment with real DB comment
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === optimisticComment.id ? res.data.comment : comment
        )
      );
    } catch (err) {
      // Rollback on failure
      setComments((prev) =>
        prev.filter((comment) => comment.id !== optimisticComment.id)
      );
      setCommentCount((prev) => prev - 1);
      console.error("Failed to add comment", err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/posts/${post.id}`,
        { caption: editedCaption },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      post.caption = editedCaption;
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update post", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <Card className="flex flex-col gap-0 sm:rounded-2xl rounded-none shadow-none sm:shadow-sm border-none sm:border-solid">
      {/* HEADER */}
      <Link
        to={`/users/${post.user.username}`}
        className="no-underline hover:underline"
      >
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={post.user?.profileImageUrl || "/default-user-profile.jpg"}
              className={"object-cover"}
            />
            <AvatarFallback>
              {post.user?.firstName?.[0]}
              {post.user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              {post.user?.firstName} {post.user?.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              @{post.user?.username} ·{" "}
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </CardHeader>
      </Link>

      {/* IMAGE */}
      {post.imageUrl && (
        <div className="px-0 py-2">
          <img
            src={post.imageUrl}
            alt="Post"
            className="border max-h-[400px] object-cover w-full aspect-[4/5] object-cover"
          />
        </div>
      )}

      {/* INTERACTION BAR */}
      <CardFooter className="flex justify-between text-muted-foreground">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="gap-1 hover:bg-transparent!"
            onClick={handleLike}
          >
            <Heart
              className={`w-6! h-6! ${
                liked ? "text-red-500 fill-red-500" : ""
              }`}
            />
            {likeCount}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="gap-1 hover:bg-transparent!"
            onClick={() => setShowAllComments((prev) => !prev)}
          >
            <MessageCircle className="w-6! h-6!" />
            {commentCount}
          </Button>
        </div>
        {user.id === post.user?.id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className={"cursor-pointer"}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500 cursor-pointer"
                onClick={() => onDelete(post.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>

      {/* CONTENT */}
      <CardContent className="text-md leading-relaxed">
        <span className="font-semibold pr-1">{post.user?.username}</span>

        {isEditing ? (
          <div className="flex gap-2 items-center">
            <Input
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              className="bg-transparent! shadow-none text-base!"
            />
            <Button
              size="sm"
              className={"bg-primary"}
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <span className="break-words whitespace-pre-wrap">
            {post.caption}
          </span>
        )}
      </CardContent>

      {commentCount > 0 && (
        <>
          {/* VIEW COMMENTS BUTTON */}
          {commentCount > 0 && !showAllComments && (
            <div className="px-6 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllComments(true)}
                className="h-auto p-0! text-xs text-muted-foreground w-fit hover:bg-transparent!"
              >
                {commentCount > 1
                  ? `View all ${commentCount} comments`
                  : `View ${commentCount} comment`}
              </Button>
            </div>
          )}

          {/* COMMENTS */}
          {showAllComments && (
            <div className="px-6 pb-0 pt-2 space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex justify-between w-full">
                  <div className="flex items-center gap-3 text-sm w-full">
                    <Link
                      to={`/users/${comment.user.username}`}
                      className="no-underline hover:underline"
                      onClick={onCloseModal}
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage
                          src={
                            comment.user?.profileImageUrl ||
                            "/default-user-profile.jpg"
                          }
                          className={"object-cover"}
                        />
                        <AvatarFallback>
                          {comment.user?.firstName?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link
                        to={`/users/${comment.user.username}`}
                        className="no-underline hover:underline"
                        onClick={onCloseModal}
                      >
                        <span className="font-medium">
                          {comment.user?.username || "You"}
                        </span>{" "}
                      </Link>
                      <span className="text-muted-foreground">
                        {comment.text}
                      </span>
                    </div>
                  </div>

                  {(user.id === comment.user.id ||
                    user.id === post.user.id) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-500 cursor-pointer"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0! text-xs text-muted-foreground w-fit hover:bg-transparent!"
                onClick={() => setShowAllComments(false)}
              >
                Hide comments
              </Button>
            </div>
          )}
        </>
      )}
      {/* ADD COMMENT INPUT */}
      <div className="flex items-center gap-2 pt-0 px-6">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onFocus={() => setIsAddingComment(true)}
          onBlur={() => setIsAddingComment(false)}
          className="bg-transparent! border-transparent! shadow-none p-0 text-base!"
        />

        {(isAddingComment || newComment.trim()) && (
          <Button
            size="icon"
            variant="ghost"
            className="bg-primary hover:bg-secondary text-white hover:text-black!"
            disabled={!newComment.trim()}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleAddComment}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </Button>
        )}
      </div>
    </Card>
  );
}
