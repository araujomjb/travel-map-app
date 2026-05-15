import React, { useState } from 'react';
import { Search, UserPlus, UserMinus, X, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

const FindFriendsModal = ({ isOpen, onClose, currentUserId, following, onFollow, onUnfollow }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      // Simple search by exact email or display name prefix
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('email', '==', searchTerm.trim()),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid !== currentUserId) {
          users.push(data);
        }
      });
      setResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFollowing = (userId) => following.includes(userId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Find Friends</DialogTitle>
          <DialogDescription>
            Search for fellow explorers by their email address.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="friend@example.com"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </form>

        <div className="mt-4 space-y-4 max-h-60 overflow-y-auto">
          {results.length === 0 && !loading && searchTerm && (
            <p className="text-center text-sm text-muted-foreground py-4">No explorers found with that email.</p>
          )}
          
          {results.map((user) => (
            <div key={user.uid} className="flex items-center justify-between p-2 rounded-lg border border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={user.photoURL} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {user.displayName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              
              {isFollowing(user.uid) ? (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => onUnfollow(user.uid)}
                >
                  <UserMinus className="h-3.5 w-3.5 mr-1" /> Unfollow
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={() => onFollow(user.uid)}
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1" /> Follow
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FindFriendsModal;
